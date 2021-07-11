const crypto = require('crypto');
const { DefaultAzureCredential } = require("@azure/identity");
const { KeyClient, CryptographyClient } = require("@azure/keyvault-keys");

const keyVaultName = process.env["KEY_VAULT_NAME"];
const keyName = process.env["KEY_NAME"];

const ENC_ALGORITHM = 'AES-256-CBC';
const IV_LENGTH = 16;
const KVUri = "https://" + keyVaultName + ".vault.azure.net";

const credential = new DefaultAzureCredential();
const client = new KeyClient(KVUri, credential);

const aes_decrypt = async function (encryptedAES, cipherText) {
    const key = await client.getKey(keyName);
    const cryptographyClient = new CryptographyClient(key, credential);

    // decrypt the random aes with RSA private key (RSA)
    const aes = await cryptographyClient.decrypt({
        algorithm: "RSA1_5",
        ciphertext: Buffer.from(encryptedAES, "base64")
    });

    const text = Buffer.from(cipherText, 'base64');
    const iv = Buffer.alloc(IV_LENGTH, 0);

    // Create a decipher object using the decrypted AES key
    var decipher = crypto.createDecipheriv(ENC_ALGORITHM, aes.result, iv);
    decipher.setAutoPadding(false);

    // Decrypt the cipher text using the AES key
    let dec = decipher.update(text, 'base64', 'utf-8');
    dec += decipher.final('utf-8');

    return dec.replace(/[\u0000-\u0010+\f]/gu,"");
}

module.exports = async function (context, req) {
    context.log('Decrypt and save health data from Notehub.');

    msgBody = req.body;

    let rspBody;
    if (msgBody) {
        if (msgBody.alert) {
            context.bindings.healthAlertsStorage = msgBody;
            rspBody = 'Alert received';
        } else {
            // Get Key and Data from Body
            const encText = msgBody.data;
            const encAES = msgBody.key;

            const decryptedPayload = await aes_decrypt(encAES, encText);

            context.bindings.healthDataStorage = JSON.parse(decryptedPayload);
            rspBody = 'Health data decrypted and saved';
        }
    }

    context.res = {
        body: rspBody
    };
}