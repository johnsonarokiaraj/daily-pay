import React, { useState } from "react";
import { Form } from "antd";
import dayjs from "dayjs";

// Components
import TransactionHeader from "./TransactionHeader";
import TransactionStats from "./TransactionStats";
import TransactionForm from "./TransactionForm";
import TransactionTable from "./TransactionTable";
import FilterDrawer from "./FilterDrawer";

// Hooks
import { useTransactions } from "./hooks/useTransactions";

const TransactionDashboard = () => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Forms
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [quickForm] = Form.useForm();

  // Custom hook for transaction logic
  const {
    // State
    transactions,
    loading,
    tags,
    stats,
    editingTransaction,
    searchText,
    searchedColumn,
    currentDateRange,
    pagination,

    // Actions
    handleSubmit,
    handleUpdateTransaction,
    handleFilter,
    handleEdit,
    cancelEdit,
    handleTableChange,
    handleSearch,
    handleReset,
    clearFilters,
  } = useTransactions();

  // Handle form submission with form reset
  const onSubmit = async (values) => {
    const success = await handleSubmit(values);
    if (success) {
      quickForm.resetFields();
      quickForm.setFieldsValue({
        transaction_date: dayjs(),
        is_credit: false,
      });
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <TransactionHeader />

      <TransactionStats stats={stats} currentDateRange={currentDateRange} />

      <TransactionForm
        form={quickForm}
        onSubmit={onSubmit}
        onFilterClick={() => setIsFilterVisible(true)}
        tags={tags}
      />

      <TransactionTable
        transactions={transactions}
        loading={loading}
        editingTransaction={editingTransaction}
        tags={tags}
        pagination={pagination}
        searchText={searchText}
        searchedColumn={searchedColumn}
        onTableChange={handleTableChange}
        onEdit={handleEdit}
        onCancelEdit={cancelEdit}
        onUpdate={handleUpdateTransaction}
        onSearch={handleSearch}
        onReset={handleReset}
        form={form}
      />

      <FilterDrawer
        open={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        form={filterForm}
        onFilter={handleFilter}
        onClear={clearFilters}
        tags={tags}
      />
    </div>
  );
};

export default TransactionDashboard;
