# Gmail SMTP Setup Guide

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

## Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "Xpect Portal" as the name
5. Click **Generate**
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

## Step 3: Configure Backend .env

Add these variables to `backend/.env`:

```env
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

**Important:**
- Use the **full email address** for `GMAIL_USER`
- Use the **16-character app password** (remove spaces) for `GMAIL_APP_PASSWORD`
- Change `JWT_SECRET` to a strong random string in production

## Step 4: Test Email Sending

1. Start the backend server: `cd backend && npm run dev`
2. Send a test invitation from the Staff Invitations page
3. Check the recipient's Gmail inbox
4. Check backend console for email delivery confirmation

## Troubleshooting

### "Invalid login" error
- Verify app password is correct (no spaces)
- Ensure 2-Step Verification is enabled
- Check GMAIL_USER is the full email address

### "Connection timeout" error
- Check internet connection
- Verify Gmail SMTP is accessible
- Check firewall settings

### Emails not received
- Check spam/junk folder
- Verify recipient email is correct
- Check backend console for errors
- Verify email was actually sent (check logs)

## Security Notes

- **Never commit** `.env` file to Git
- Use different Gmail account for production
- Rotate app passwords regularly
- Use strong JWT_SECRET in production
