const axios = require('axios');
const fs = require('fs');

async function updateNgrokUrl() {
    try {
        const res = await axios.get('http://127.0.0.1:4040/api/tunnels');
        const tunnels = res.data.tunnels;
        const httpsTunnel = tunnels.find(t => t.proto === 'https');
        if (!httpsTunnel) return;

        const url = httpsTunnel.public_url;

        const filePath = '../mobile_application_1/lib/config.dart';

        let content = fs.readFileSync(filePath, 'utf8');

        content = content.replace(
            /static const baseUrl = ".*";/,
            `static const baseUrl = "${url}";`
        );

        fs.writeFileSync(filePath, content);
        console.log('UPDATED:', url);
    } catch (err) {
        console.log('ERROR', err);
    }
}

updateNgrokUrl();