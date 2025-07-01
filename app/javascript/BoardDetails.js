import React from 'react';

// Expects a 'mainTag' prop with credit_sum, debit_sum, and sum (balance)
export default function BoardDetails({ mainTag, subTags }) {
  if (!mainTag) return null;
  return (
    <div className="board-details">
      <h2>Main Tag: {mainTag.tag}</h2>
      <ul>
        <li><strong>Credit:</strong> {mainTag.credit_sum}</li>
        <li><strong>Debit:</strong> {mainTag.debit_sum}</li>
        <li><strong>Balance:</strong> {mainTag.sum}</li>
      </ul>
      {subTags && subTags.length > 0 && (
        <div className="subtags-section">
          <h3>Subtags</h3>
          <ul>
            {subTags.map(sub => (
              <li key={sub.tag}>
                <strong>{sub.tag}</strong>: Balance: {sub.balance} (Credit: {sub.credit_sum}, Debit: {sub.debit_sum})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
