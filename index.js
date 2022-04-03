const wa = require('@open-wa/wa-automate');
const mime = require('mime-types');
const fs = require('fs');
const { removeBackgroundFromImageUrl, removeBackgroundFromImageFile } = require('remove.bg');
const connectDB = require('./configs/DB');
const Wabot = require('./models/wabot');

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
		// console.log(pesan);
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
					result = await Wabot.create({
						email,
						password,
						status
					});
					console.log(result);
					console.log('Data Berhasil Ditambahkan');
				} else {
					result = await Wabot.create({
						email,
						password
					});
					console.log(result);
					console.log('Data Berhasil Ditambahkan');
				}
				await client.sendText(message.from, `🤖 *Email ${result.email} Berhasil Ditambahkan*\n`);
			} else {
				await client.sendText(message.from, `🤖 *Email Tidak Boleh Kosong*\nContoh: *.add* _email:password_\n`);
			}
		}
		if (perintah === '.active') {
			if (value && value !== '') {
				if (value === 'ALL') {
					const result = await Wabot.find({ status: 'active' }).select('email password');
					// console.log(result);
					let list_active = [];
					for (let i = 0; i < result.length; i++) {
						list_active.push(`${result[i].email} : ${result[i].password}\n`);
						// list_active += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
					}
					if (result.length > 0) {
						client.sendText(message.from, `🤖 *[DAFTAR ACCOUNT STATUS ACTIVE]*\n${list_active.join('')}\n`);
					} else {
						client.sendText(message.from, `🤖 *Tidak ada akun berstatus Active*\n`);
					}
				} else {
					const check = await Wabot.findOne({ email: value });
					if (check.status !== 'active') {
						const resultUpdate = await Wabot.findOneAndUpdate(
							{ email: value },
							{ status: 'active' },
							{ new: true }
						);
						client.sendText(message.from, `🤖 *${resultUpdate.email} berhasil diUpdate*\n`);
						const result = await Wabot.find({ status: 'active' }).limit(5).select('email password');
						// console.log(result);
						let list_active = [];
						for (let i = 0; i < result.length; i++) {
							list_active.push(`${result[i].email} : ${result[i].password}\n`);
							// list_active += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
						}
						if (result.length > 0) {
							client.sendText(
								message.from,
								`🤖 *[DAFTAR 5 ACCOUNT TERATAS STATUS ACTIVE]*\n${list_active.join('')}\n`
							);
						}
					} else {
						client.sendText(message.from, `🤖 *${value} sudah berstatus Active*\n`);
						const result = await Wabot.find({ status: 'active' }).limit(5).select('email password');
						// console.log(result);
						let list_active = [];
						for (let i = 0; i < result.length; i++) {
							list_active.push(`${result[i].email} : ${result[i].password}\n`);
							// list_active += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
						}
						if (result.length > 0) {
							client.sendText(
								message.from,
								`🤖 *[DAFTAR 5 ACCOUNT TERATAS STATUS ACTIVE]*\n${list_active.join('')}\n`
							);
						}
					}
				}
			} else {
				const result = await Wabot.find({ status: 'active' }).limit(5).select('email password');
				// console.log(result);
				let list_active = [];
				for (let i = 0; i < result.length; i++) {
					list_active.push(`${result[i].email} : ${result[i].password}\n`);
					// list_active += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
				}
				if (result.length > 0) {
					client.sendText(
						message.from,
						`🤖 *[DAFTAR 5 ACCOUNT TERATAS STATUS ACTIVE]*\n${list_active.join('')}\n`
					);
				} else {
					client.sendText(message.from, `🤖 *Tidak ada akun berstatus Active*\n`);
				}
			}
		}
		if (perintah === '.disabled') {
			if (value && value !== '') {
				if (value === 'ALL') {
					const result = await Wabot.find({ status: 'disabled' }).select('email password');
					// console.log(result);
					let list_disabled = [];
					for (let i = 0; i < result.length; i++) {
						list_disabled.push(`${result[i].email} : ${result[i].password}\n`);
						// list_disabled += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
					}
					if (result.length > 0) {
						client.sendText(
							message.from,
							`🤖 *[DAFTAR ACCOUNT STATUS DISABLED]*\n${list_disabled.join('')}\n`
						);
					} else {
						client.sendText(message.from, `🤖 *Tidak ada akun berstatus Disabled*\n`);
					}
				} else {
					const check = await Wabot.findOne({ email: value });
					if (check.status !== 'disabled') {
						const resultUpdate = await Wabot.findOneAndUpdate(
							{ email: value },
							{ status: 'disabled' },
							{ new: true }
						);
						client.sendText(message.from, `🤖 *${resultUpdate.email} berhasil diUpdate*\n`);
						const result = await Wabot.find({ status: 'disabled' }).select('email password');
						// console.log(result);
						let list_disabled = [];
						for (let i = 0; i < result.length; i++) {
							list_disabled.push(`${result[i].email} : ${result[i].password}\n`);
							// list_disabled += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
						}
						if (result.length > 0) {
							client.sendText(
								message.from,
								`🤖 *[DAFTAR 5 ACCOUNT TERATAS STATUS DISABLED]*\n${list_disabled.join('')}\n`
							);
						}
					} else {
						client.sendText(message.from, `🤖 *${value} sudah berstatus Disabled*\n`);
						const result = await Wabot.find({ status: 'disabled' }).select('email password');
						// console.log(result);
						let list_disabled = [];
						for (let i = 0; i < result.length; i++) {
							list_disabled.push(`${result[i].email} : ${result[i].password}\n`);
							// list_disabled += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
						}
						if (result.length > 0) {
							client.sendText(
								message.from,
								`🤖 *[DAFTAR 5 ACCOUNT TERATAS STATUS DISABLED]*\n${list_disabled.join('')}\n`
							);
						}
					}
				}
			} else {
				const result = await Wabot.find({ status: 'disabled' }).limit(5).select('email password');
				// console.log(result);
				let list_disabled = [];
				for (let i = 0; i < result.length; i++) {
					list_disabled.push(`${result[i].email} : ${result[i].password}\n`);
					// list_disabled += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
				}
				if (result.length > 0) {
					client.sendText(
						message.from,
						`🤖 *[DAFTAR 5 ACCOUNT TERATAS STATUS DISABLED]*\n${list_disabled.join('')}\n`
					);
				} else {
					client.sendText(message.from, `🤖 *Tidak ada akun berstatus Disabled*\n`);
				}
			}
		}
		if (perintah === '.sold') {
			if (value && value !== '') {
				if (value === 'ALL') {
					const result = await Wabot.find({ status: 'sold' }).sort({ _id: -1 }).select('email password');
					// console.log(result);
					let list_sold = [];
					for (let i = 0; i < result.length; i++) {
						if (i === 0) {
							list_sold.push(`${result[i].email} : ${result[i].password} *(Last Sold)*\n`);
						} else {
							list_sold.push(`${result[i].email} : ${result[i].password}\n`);
						}
						// list_sold += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
					}
					if (result.length > 0) {
						client.sendText(message.from, `🤖 *[DAFTAR ACCOUNT STATUS SOLD]*\n${list_sold.join('')}\n`);
					} else {
						client.sendText(message.from, `🤖 *Tidak ada akun berstatus Sold*\n`);
					}
				} else {
					const check = await Wabot.findOne({ email: value });
					if (check.status !== 'sold') {
						const resultUpdate = await Wabot.findOneAndUpdate(
							{ email: value },
							{ status: 'sold' },
							{ new: true }
						);
						client.sendText(message.from, `🤖 *${resultUpdate.email} berhasil diUpdate*\n`);
						const result = await Wabot.find({ status: 'sold' })
							.limit(3)
							.sort({ _id: -1 })
							.select('email password');
						// console.log(result);
						let list_sold = [];
						for (let i = 0; i < result.length; i++) {
							if (i === 0) {
								list_sold.push(`${result[i].email} : ${result[i].password} *(Last Sold)*\n`);
							} else {
								list_sold.push(`${result[i].email} : ${result[i].password}\n`);
							}
							// list_sold += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
						}
						const resultActive = await Wabot.find({ status: 'active' }).limit(5).select('email password');
						// console.log(result);
						let list_active = [];
						for (let i = 0; i < resultActive.length; i++) {
							list_active.push(`${resultActive[i].email} : ${resultActive[i].password}\n`);
							// list_active += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
						}
						if (result.length > 0) {
							if (result.length > 3) {
								const deleteData = await Wabot.findOneAndUpdate(
									{ status: 'sold' },
									{ status: 'inactive' }
								);
								console.log(deleteData);
								const result = await Wabot.find({ status: 'sold' })
									.limit(3)
									.sort({ _id: -1 })
									.select('email password');
								// console.log(result);
								let list_sold = [];
								for (let i = 0; i < result.length; i++) {
									if (i === 0) {
										list_sold.push(`${result[i].email} : ${result[i].password} *(Last Sold)*\n`);
									} else {
										list_sold.push(`${result[i].email} : ${result[i].password}\n`);
									}
									// list_sold += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
								}
								const resultActive = await Wabot.find({ status: 'active' })
									.limit(5)
									.select('email password');
								// console.log(result);
								let list_active = [];
								for (let i = 0; i < resultActive.length; i++) {
									list_active.push(`${resultActive[i].email} : ${resultActive[i].password}\n`);
									// list_active += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
								}
								if (resultActive.length > 0) {
									client.sendText(
										message.from,
										`🤖 *[DAFTAR 3 ACCOUNT TERATAS STATUS SOLD]*\n${list_sold.join(
											''
										)}\n\n*[DAFTAR 5 ACCOUNT TERATAS STATUS SOLD]*\n${list_active.join('')}`
									);
								} else {
									client.sendText(
										message.from,
										`🤖 *[DAFTAR 3 ACCOUNT TERATAS STATUS SOLD]*\n${list_sold.join(
											''
										)}\n\n*[DAFTAR 5 ACCOUNT TERATAS STATUS SOLD]*\nTidak ada akun yang berstatus Active`
									);
								}
							} else {
								if (resultActive.length > 0) {
									client.sendText(
										message.from,
										`🤖 *[DAFTAR 3 ACCOUNT TERATAS STATUS SOLD]*\n${list_sold.join(
											''
										)}\n*[DAFTAR 5 ACCOUNT TERATAS STATUS SOLD]*\n${list_active.join('')}`
									);
								} else {
									client.sendText(
										message.from,
										`🤖 *[DAFTAR 3 ACCOUNT TERATAS STATUS SOLD]*\n${list_sold.join(
											''
										)}\n*[DAFTAR 5 ACCOUNT TERATAS STATUS SOLD]*\nTidak ada akun yang berstatus Active`
									);
								}
							}
						}
					} else {
						client.sendText(message.from, `🤖 *${value} sudah berstatus Sold*\n`);
						const result = await Wabot.find({ status: 'sold' })
							.sort({ _id: -1 })
							.limit(3)
							.select('email password');
						// console.log(result);
						let list_sold = [];
						for (let i = 0; i < result.length; i++) {
							if (i === 0) {
								list_sold.push(`${result[i].email} : ${result[i].password} *(Last Sold)*\n`);
							} else {
								list_sold.push(`${result[i].email} : ${result[i].password}\n`);
							}
							// list_sold += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
						}
						const resultActive = await Wabot.find({ status: 'active' }).limit(5).select('email password');
						// console.log(result);
						let list_active = [];
						for (let i = 0; i < resultActive.length; i++) {
							list_active.push(`${resultActive[i].email} : ${resultActive[i].password}\n`);
							// list_active += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
						}
						if (result.length > 0) {
							if (resultActive.length > 0) {
								client.sendText(
									message.from,
									`🤖 *[DAFTAR 3 ACCOUNT TERATAS STATUS SOLD]*\n${list_sold.join(
										''
									)}\n\n*[DAFTAR 5 ACCOUNT TERATAS STATUS SOLD]*\n${list_active.join('')}`
								);
							} else {
								client.sendText(
									message.from,
									`🤖 *[DAFTAR 3 ACCOUNT TERATAS STATUS SOLD]*\n${list_sold.join(
										''
									)}\n\n*[DAFTAR 5 ACCOUNT TERATAS STATUS SOLD]*\nTidak ada akun yang berstatus Active`
								);
							}
						}
					}
				}
			} else {
				const result = await Wabot.find({ status: 'sold' }).sort({ _id: -1 }).limit(5).select('email password');
				// console.log(result);
				let list_sold = [];
				for (let i = 0; i < result.length; i++) {
					if (i === 0) {
						list_sold.push(`${result[i].email} : ${result[i].password} *(Last Sold)*\n`);
					} else {
						list_sold.push(`${result[i].email} : ${result[i].password}\n`);
					}
					// list_sold += `${i + 1}. ${result[i].email} : ${result[i].password}\n`;
				}
				if (result.length > 0) {
					client.sendText(
						message.from,
						`🤖 *[DAFTAR 3 ACCOUNT TERATAS STATUS SOLD]*\n${list_sold.join('')}\n`
					);
				} else {
					client.sendText(message.from, `🤖 *Tidak ada akun berstatus Sold*\n`);
				}
			}
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
