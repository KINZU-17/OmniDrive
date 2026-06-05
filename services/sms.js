/**
 * sms.js — provider-agnostic SMS sender.
 *
 * Picks a provider from env (SMS_PROVIDER = 'twilio' | 'africastalking').
 * When no provider is configured (e.g. local dev), it SIMULATES: the message is
 * logged to the server console and `{ simulated: true }` is returned so callers
 * can surface the code to the developer. In production an unconfigured/failed
 * provider throws, so OTPs are never silently dropped.
 *
 * No SDKs required — both providers are called over their plain HTTP APIs.
 */
'use strict';
const logger = require('../config/logger');

const IS_PROD = process.env.NODE_ENV === 'production';

async function sendViaTwilio(to, message) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const body = new URLSearchParams({ To: to, From: from, Body: message });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Twilio ${res.status}: ${await res.text()}`);
}

async function sendViaAfricasTalking(to, message) {
  const body = new URLSearchParams({ username: process.env.AT_USERNAME, to, message });
  if (process.env.AT_SENDER_ID) body.append('from', process.env.AT_SENDER_ID);
  const res = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      apiKey: process.env.AT_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`AfricasTalking ${res.status}: ${await res.text()}`);
}

/**
 * Send an SMS. Returns { sent: boolean, simulated: boolean }.
 * Throws only in production when a configured provider fails.
 */
async function sendSms(to, message) {
  const provider = (process.env.SMS_PROVIDER || '').toLowerCase();
  try {
    if (provider === 'twilio' && process.env.TWILIO_ACCOUNT_SID) {
      await sendViaTwilio(to, message);
      logger.info('SMS sent via Twilio', { to });
      return { sent: true, simulated: false };
    }
    if ((provider === 'africastalking' || provider === 'at') && process.env.AT_API_KEY) {
      await sendViaAfricasTalking(to, message);
      logger.info('SMS sent via Africa\'s Talking', { to });
      return { sent: true, simulated: false };
    }
  } catch (e) {
    logger.error('SMS send failed', { error: e.message, to });
    if (IS_PROD) throw e; // never silently drop in production
  }

  // Dev / unconfigured provider: simulate so the flow is usable locally.
  if (IS_PROD) {
    throw new Error('No SMS provider configured (set SMS_PROVIDER + credentials).');
  }
  logger.warn('SMS simulated — no provider configured', { to });
  console.log(`\n[SMS:simulated] to ${to}: ${message}\n`);
  return { sent: true, simulated: true };
}

module.exports = { sendSms };
