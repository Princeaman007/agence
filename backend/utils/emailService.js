import nodemailer from 'nodemailer';

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true pour le port 465, false pour les autres
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Envoyer un email de vérification
export const sendVerificationEmail = async (email, firstName, verificationToken) => {
  const transporter = createTransporter();
  
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  
  const mailOptions = {
    from: `"Plateforme de Rencontre" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Vérifiez votre adresse email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #777;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue ${firstName} ! 💕</h1>
          </div>
          <div class="content">
            <p>Merci de vous être inscrit sur notre plateforme de rencontre !</p>
            <p>Pour commencer à utiliser votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
            <center>
              <a href="${verificationUrl}" class="button">Vérifier mon email</a>
            </center>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            <p style="color: #777; font-size: 14px; margin-top: 20px;">
              Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte, ignorez simplement cet email.
            </p>
          </div>
          <div class="footer">
            <p>© 2025 Plateforme de Rencontre. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️  Email de vérification envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email de vérification');
  }
};

// Envoyer un email de réinitialisation de mot de passe
export const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"Plateforme de Rencontre" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Réinitialisation du mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour ${firstName},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <center>
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </center>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            <div class="warning">
              <strong>⚠️  Important :</strong> Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️  Email de réinitialisation envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
  }
};

// Envoyer un email de bienvenue après vérification
export const sendWelcomeEmail = async (email, firstName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Plateforme de Rencontre" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Bienvenue sur notre plateforme ! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1>Bienvenue ${firstName} ! 🎉</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Votre compte est maintenant actif !</p>
            <h3>Pour bien démarrer :</h3>
            <ul>
              <li>✨ Complétez votre profil avec de belles photos</li>
              <li>💬 Répondez au test de compatibilité</li>
              <li>💕 Commencez à découvrir d'autres profils</li>
              <li>🌟 Pensez à passer Premium pour des fonctionnalités avancées</li>
            </ul>
            <center>
              <a href="${process.env.CLIENT_URL}/profile/edit" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Compléter mon profil
              </a>
            </center>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️  Email de bienvenue envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};