import React, { useState } from "react";
import { Form } from "antd";
import dayjs from "dayjs";

// Components
import TransactionHeader from "./TransactionHeader";
import TransactionStats from "./TransactionStats";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList"; // Changed from TransactionTable to TransactionList
import FilterDrawer from "./FilterDrawer";
import SaveViewModal from "./SaveViewModal";

// Hooks
import { useTransactions } from "./hooks/useTransactions";

const TransactionDashboard = () => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isSaveViewModalVisible, setIsSaveViewModalVisible] = useState(false);

  // Forms
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [quickForm] = Form.useForm();

  // Custom hook for transaction logic
  const {
    // State
    transactions,
    loading,
    loadingMore,
    tags,
    stats,
    editingTransaction,
    searchText,
    searchedColumn,
    currentDateRange,
    pagination,
    appliedFilters,

    // Actions
    handleSubmit,
    handleUpdateTransaction,
    handleFilter,
    handleEdit,
    cancelEdit,
    handleSearch,
    handleReset,
    clearFilters,
    hasFiltersApplied,
    hasActiveFilters,
    fetchTransactions,
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
    <div style={{ padding: "12px" }}>
      <TransactionHeader />

      <TransactionStats
        stats={stats}
        pagination={pagination}
        currentDateRange={currentDateRange}
      />

      <TransactionForm
        form={quickForm}
        onSubmit={onSubmit}
        onFilterClick={() => setIsFilterVisible(true)}
        onSaveViewClick={() => setIsSaveViewModalVisible(true)}
        hasFiltersApplied={hasFiltersApplied()}
        hasActiveFilters={hasActiveFilters()}
        tags={tags}
      />

      <TransactionList
        transactions={transactions}
        loading={loading}
        loadingMore={loadingMore}
        editingTransaction={editingTransaction}
        tags={tags}
        pagination={pagination}
        searchText={searchText}
        fetchTransactions={fetchTransactions}
        searchedColumn={searchedColumn}
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

      <SaveViewModal
        open={isSaveViewModalVisible}
        onClose={() => setIsSaveViewModalVisible(false)}
        appliedFilters={appliedFilters}
      />
    </div>
  );
};

export default TransactionDashboard;
