const wa = require('@open-wa/wa-automate');
const mime = require('mime-types');
const fs = require('fs');
const { removeBackgroundFromImageUrl, removeBackgroundFromImageFile } = require('remove.bg');
const connectDB = require('./configs/DB');
const Wabot = require('models/wabot');

connectDB();

wa
	.create({
		sessionId: 'COVID_HELPER',
		multiDevice: true, //required to enable multiDevice support
		authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
		blockCrashLogs: true,
		disableSpins: true,
		headless: true,
		hostNotificationLang: 'PT_BR',
		logConsole: false,
		popup: true,
		qrTimeout: 0 //0 means it will wait forever for you to scan the qr code
	})
	.then((client) => start(client));

function start(client) {
	client.onMessage(async (message) => {
		// console.log(message);
		const pesan = message.text.split(' ');
		const perintah = pesan[0];
		const value = pesan[1];
		const status = pesan[2];
		console.log(pesan);
		if (message.text === 'Hi') {
			await client.sendText(message.from, '👋 Hello!');
		}
		if (message.text === '.help') {
			await client.sendText(
				message.from,
				'🤖 *[DAFTAR LIST COMMAND]*\n*.account* // _Melihat Daftar Account Semua Status_\n*.active* // _Melihat 5 Daftar Account Teratas Status Active_\n*.disabled* // _Melihat 5 Daftar Account Teratas Status Disabled_\n*.sold* // _Melihat 5 Daftar Account Teratas Status Sold_\n*.help* // _Melihat Daftar Command_\n'
			);
		}
		if (perintah === '.add') {
			if (value && value !== '') {
				const word = value.split(':');
				const email = word[0];
				const password = word[1];
				let result;
				if (status) {
					result = Wabot.create({
						email,
						password,
						status
					});
					console.log(result);
					console.log('Data Berhasil Ditambahkan');
				} else {
					result = Wabot.create({
						email,
						password
					});
					console.log(result);
					console.log('Data Berhasil Ditambahkan');
				}
				client.sendText(message.from, `🤖 *Email ${result.email} Berhasil Ditambahkan*\n`);
			} else {
				client.sendText(message.from, `🤖 *Email Tidak Boleh Kosong*\nContoh: *.add* _email:password_\n`);
				// const result = Wabot.find({ status: 'active' }).limit(20).select('email password');
				// if (result) {
				// 	client.sendText(message.from, `🤖 *[DAFTAR 5 ACCOUNT TERATAS STATUS ACTIVE]*\n${result}\n`);
				// } else {
				// 	client.sendText(message.from, `🤖 *Tidak ada akun berstatus Active*\n`);
				// }
			}
		}
		if (perintah === '.active') {
			await client.sendText(
				message.from,
				'🤖 *[DAFTAR 5 ACCOUNT TERATAS STATUS ACTIVE]*\n1. @covid_helper_bot\n2. @covid_helper_bot\n3. @covid_helper_bot\n4. @covid_helper_bot\n5. @covid_helper_bot\n'
			);
		}
		if (perintah === '.disabled') {
			await client.sendText(
				message.from,
				'🤖 *[DAFTAR 5 ACCOUNT TERATAS STATUS DISABLED]*\n1. @covid_helper_bot\n2. @covid_helper_bot\n3. @covid_helper_bot\n4. @covid_helper_bot\n5. @covid_helper_bot\n'
			);
		}
		if (perintah === '.sold') {
			await client.sendText(
				message.from,
				'🤖 *[DAFTAR 5 ACCOUNT TERATAS STATUS SOLD]*\n1. @covid_helper_bot\n2. @covid_helper_bot\n3. @covid_helper_bot\n4. @covid_helper_bot\n5. @covid_helper_bot\n'
			);
		}
		if (message.type === 'image' && message.text === '.removeBg') {
			const filename = `${message.t}.${mime.extension(message.mimetype)}`;
			const mediaData = await wa.decryptMedia(message);
			const imageBase64 = `data:${message.mimetype};base64,${mediaData.toString('base64')}`;
			// await client.sendImage(message.from, imageBase64, filename, `You just sent me this ${message.type}`);
			// console.log('FileName: ' + filename);
			// console.log('mediaData: ' + mediaData);
			// console.log('imageBase64: ' + imageBase64);
			fs.writeFileSync(`./image/${filename}`, mediaData, function(err) {
				if (err) {
					return console.log(err);
				}
				console.log('The file was saved!');
			});

			// console.log(filename);
			const outputName = filename.split('.');
			const localFile = `./image/${filename}`;
			const outputFile = `./removeBg/${outputName[0]}-removebg.png`;
			removeBackgroundFromImageFile({
				path: localFile,
				apiKey: '3DF53nUpKe75gjN6QBZhd4wx',
				size: 'auto',
				type: 'auto',
				scale: 'original',
				outputFile
			})
				.then((result) => {
					console.log(`File saved to ${outputFile}`);

					client.sendImage(
						message.from,
						outputFile,
						`${outputName[0]}-removebg.png`,
						`Your background ${message.type} has been removed!`
					);
				})
				.catch((errors) => {
					console.log(JSON.stringify(errors));
				});
		}
	});
}
