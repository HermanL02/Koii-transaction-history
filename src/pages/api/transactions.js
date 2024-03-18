// pages/api/transactions.js
const koiiWeb3 = require("@_koi/web3.js");

async function getKoiiTransactionHistory(pubKey, limit = 10, beforeSignature = null) {
  try {
    const connection = new koiiWeb3.Connection("https://testnet.koii.live", "confirmed");
    const pubKeyObject = new koiiWeb3.PublicKey(pubKey);
    const options = { limit };
    console.log("Public Key:", pubKey);
    if (beforeSignature) {
      
      options.before = beforeSignature;
    }
    const signatures = await connection.getSignaturesForAddress(pubKeyObject, options);

    const transactions = [];
    for (let signatureInfo of signatures) {
      const transaction = await connection.getTransaction(signatureInfo.signature);
      transactions.push(transaction);
    }
    return transactions;
  } catch (error) {
    console.error("Error fetching Koii transaction history:", error);
    throw error; // 抛出错误，以便响应可以捕获
  }
}

export default async function handler(req, res) {
  const { pubKey, limit, beforeSignature } = req.query;
  try {
    const transactions = await getKoiiTransactionHistory(pubKey, Number(limit), beforeSignature);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}
