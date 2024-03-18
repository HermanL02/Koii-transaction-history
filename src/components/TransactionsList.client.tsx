// components/TransactionsList.client.jsx
"use client";
import { useEffect, useState } from 'react';
interface Transaction {
  blockTime: number;
  meta: {
    err: null | any; 
    fee: number;
    innerInstructions: any[]; 
    logMessages: string[];
    postBalances: number[];
    postTokenBalances: any[]; 
    preBalances: number[];
    preTokenBalances: any[]; 
    rewards: any[]; 
    status: {
      Ok: null | any; 
    };
  };
  slot: number;
  transaction: {
    message: {
      header: {
        numReadonlySignedAccounts: number;
        numReadonlyUnsignedAccounts: number;
        numRequiredSignatures: number;
      };
      accountKeys: string[];
      recentBlockhash: string;
      instructions: {
        accounts: number[];
        data: string;
        programIdIndex: number;
      }[];
      indexToProgramIds?: any; 
    };
    signatures: string[];
  };
}
interface TransactionsListProps {
  transactions: Transaction[];
}
function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pubKey, setPubKey] = useState('');
  const [hasMore, setHasMore] = useState(true); 
  const [minAmount, setMinAmount] = useState(0); 
  const [maxAmount, setMaxAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const fetchTransactions = async (beforeSignature = '') => {
    if (!pubKey) return;
    setLoading(true);
    try {
      const url = `/api/transactions?pubKey=${pubKey}&limit=100${beforeSignature ? `&beforeSignature=${beforeSignature}` : ''}`;
      const response = await fetch(url);
      const newData = await response.json();
  
      if (newData && newData.length > 0) {
        setTransactions(prev => beforeSignature ? [...prev, ...newData] : newData);
        const lastTransaction = newData[newData.length - 1];
        const lastDate = new Date(lastTransaction.blockTime * 1000);
    
        // 逻辑调整：当最后一条数据的日期仍然大于或等于开始日期时，继续加载
        if (startDate && lastDate >= new Date(startDate)) {
         
          setHasMore(true);
          // Auto Load More Avoid 
          // const lastSignature = lastTransaction.transaction.signatures[0];
          // fetchTransactions(lastSignature);
          console.log("has more retreiving");
        } else {
          // 如果已经加载到开始日期之前的数据，或者没有设置开始日期，停止自动加载
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  

  useEffect(() => {
    setTransactions([]); // 清空旧的交易列表
    setHasMore(true); // 重置加载状态
    fetchTransactions();
  }, [pubKey, endDate]); // 当 pubKey 或 endDate 变化时重新加载

  // 加载更多交易的函数
  const loadMoreTransactions = () => {
    if (transactions.length > 0) {
      const lastSignature = transactions[transactions.length - 1].transaction.signatures[0];
      fetchTransactions(lastSignature);
    }
  };

  const handlePubKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPubKey(event.target.value);
  };

  // 过滤交易的函数
  const filteredTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.blockTime * 1000);
    const startDateObj = startDate ? new Date(startDate) : new Date(-8640000000000000);
    const endDateObj = endDate ? new Date(endDate) : new Date(8640000000000000);
  
    // 假设您已经有了计算金额的逻辑
    const accountIndex = transaction.transaction.message.accountKeys.indexOf(pubKey);
    const amount = (transaction.meta.postBalances[accountIndex] - transaction.meta.preBalances[accountIndex]) / 1000000000; // 假设单位是Solana的lamports，这里转换为SOL
  
    return date >= startDateObj && date <= endDateObj && amount >= minAmount && amount <= maxAmount;
  });
  

  return (
<div className="flex flex-col p-4">
  <input
    className="mb-2 p-2 border border-gray-300 rounded"
    type="text"
    value={pubKey}
    onChange={handlePubKeyChange}
    placeholder="Enter public key"
  />
  <input
    className="mb-2 p-2 border border-gray-300 rounded"
    type="number"
    value={minAmount}
    onChange={(e) => setMinAmount(Number(e.target.value))}
    placeholder="Minimum Amount"
  />
  <input
    className="mb-2 p-2 border border-gray-300 rounded"
    type="number"
    value={maxAmount}
    onChange={(e) => setMaxAmount(Number(e.target.value))}
    placeholder="Maximum Amount"
  />
  <input
    className="mb-2 p-2 border border-gray-300 rounded"
    type="date"
    value={startDate}
    onChange={e => setStartDate(e.target.value)}
    placeholder="Start Date"
  />
  <input
    className="mb-4 p-2 border border-gray-300 rounded"
    type="date"
    value={endDate}
    onChange={e => setEndDate(e.target.value)}
    placeholder="End Date"
  />
  <ul className="list-disc pl-5 mb-4">
    {filteredTransactions.map((transaction, index) => {
      const accountIndex = transaction.transaction.message.accountKeys.indexOf(pubKey);
      const amount = transaction.meta.postBalances[accountIndex] - transaction.meta.preBalances[accountIndex];
      const date = new Date(transaction.blockTime * 1000).toLocaleString();
      const counterpartyValue = transaction.transaction.message.accountKeys[1] !== pubKey ?transaction.transaction.message.accountKeys[1] : transaction.transaction.message.accountKeys[0];
      return (
        <li key={index} className="mb-2">
          <span className="font-semibold">Counterparty:</span> {counterpartyValue}<br />
          <span className="font-semibold">Amount:</span> {amount/1000000000}<br />
          <span className="font-semibold">Date:</span> {date}
        </li>
      );
    })}
  </ul>
  {hasMore && (
    <button 
      onClick={loadMoreTransactions} 
      disabled={loading}
      className={`p-2 bg-blue-500 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
    >
      {loading ? 'Loading...' : 'Load More'}
    </button>
  )}
</div>
  );

}

export default TransactionsList;