export const getOnboardingSuccessTemplate = ({
  cleanerName,
  username,
  loginUrl,
}) => {
  return `
  <table width="100%" style="background:#f4f6f9;padding:40px 0;font-family:Arial,sans-serif;">
    <tr>
      <td align="center">

        <table width="600" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#2e4150;padding:30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;">
                Welcome to Xpect Cleaning ERP
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px;">

              <p style="font-size:15px;color:#555;line-height:1.7;margin-top:0;">
                Hello <b>${cleanerName}</b>,
              </p>

              <p style="font-size:15px;color:#555;line-height:1.7;">
                Your onboarding form has been successfully submitted and verified in our system.
              </p>

              <p style="font-size:15px;color:#555;line-height:1.7;">
                You can now access the Xpect Cleaning ERP Portal using your login credentials.
              </p>

              <!-- Credentials -->
              <table width="100%" style="margin:25px 0;background:#f6f7fb;border-radius:12px;padding:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px;font-size:14px;color:#777;">
                      <b>Username:</b> ${username}
                    </p>

                    <p style="margin:0;font-size:14px;color:#777;">
                      <b>Password:</b> The password you created during onboarding
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:30px auto;">
                <tr>
                  <td align="center" bgcolor="#2e4150" style="border-radius:10px;">
                    <a href="${loginUrl}"
                      style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">
                      Login to ERP Portal
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px;color:#777;line-height:1.7;">
                Please keep your login credentials secure and do not share them with anyone.
              </p>

              <p style="font-size:14px;color:#777;line-height:1.7;">
                If you face any issues accessing the portal, please contact the administration team.
              </p>

              <p style="font-size:14px;color:#555;margin-top:35px;">
                Regards,<br/>
                <b>Xpect Cleaning Management</b>
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
  `;
};
