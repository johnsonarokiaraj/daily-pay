import { useState, useEffect } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import axios from "axios";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState({ count: 0, credit: 0, debit: 0 });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  // State for tracking current date range filter
  const [currentDateRange, setCurrentDateRange] = useState({
    startDate: dayjs().startOf("month"),
    endDate: dayjs().endOf("month"),
  });

  // State for pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50", "100"],
  });

  const fetchTransactions = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await axios.get("/api/transactions", {
        params: filters,
      });

      if (response.data.transactions) {
        setTransactions(response.data.transactions);
        setStats({
          count: response.data.transactions.length,
          credit: response.data.credit || 0,
          debit: response.data.debit || 0,
        });

        // Update pagination total with full dataset length
        setPagination((prev) => ({
          ...prev,
          total: response.data.transactions.length,
          current: 1, // Reset to first page when data changes
        }));
      }
    } catch (error) {
      message.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get("/api/tags");
      if (response.data.tags) {
        // Extract just the tag names from the API response
        const tagNames = response.data.tags.map((tag) => tag.name);
        setTags(tagNames);
      }
    } catch (error) {
      console.error("Failed to load tags");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        transaction_date: values.transaction_date.format("DD-MM-YYYY"),
        tag_list:
          values.tag_list && values.tag_list.join
            ? values.tag_list.join(",")
            : "",
        is_credit: values.is_credit || false,
      };

      await axios.post("/api/transactions", { transaction: data });
      message.success("Transaction added successfully");

      // Reset to first page when adding new transaction
      setPagination((prev) => ({ ...prev, current: 1 }));
      fetchTransactions();
      return true; // Success indicator
    } catch (error) {
      message.error("Failed to save transaction");
      return false;
    }
  };

  const handleUpdateTransaction = async (values) => {
    try {
      const data = {
        ...values,
        transaction_date: values.transaction_date.format("DD-MM-YYYY"),
        tag_list:
          values.tag_list && values.tag_list.join
            ? values.tag_list.join(",")
            : "",
        is_credit: values.is_credit || false,
      };

      await axios.patch(`/api/transactions/${editingTransaction.id}`, {
        transaction: data,
      });
      message.success("Transaction updated successfully");

      setEditingTransaction(null);
      fetchTransactions();
      return true;
    } catch (error) {
      message.error("Failed to update transaction");
      return false;
    }
  };

  const handleFilter = (values) => {
    const filters = {};
    if (values.start_date)
      filters.start_date = values.start_date.format("DD-MM-YYYY");
    if (values.end_date)
      filters.end_date = values.end_date.format("DD-MM-YYYY");
    if (values.tag_list && values.tag_list.length)
      filters.tag_list = values.tag_list.join(",");
    if (values.start_date || values.end_date) filters.allow_date = "1";

    // Update current date range state
    setCurrentDateRange({
      startDate: values.start_date || dayjs().startOf("month"),
      endDate: values.end_date || dayjs().endOf("month"),
    });

    // Reset to first page when applying filters
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchTransactions(filters);
  };

  const handleEdit = (record) => {
    console.log("Editing record:", record);
    console.log("Original date:", record.transaction_date);

    setEditingTransaction(record);
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
  };

  // Handle table pagination, sorting, and filtering changes
  const handleTableChange = (newPagination, filters, sorter) => {
    // Only update pagination state - no API call needed for frontend pagination
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    if (dataIndex === "tag_list") {
      // For tags, store the array of selected tags
      setSearchText(selectedKeys);
    } else {
      // For other columns, store the first selected key
      setSearchText(selectedKeys[0]);
    }
    setSearchedColumn(dataIndex);
    // Don't auto-close the dropdown, let user manually close or reset
  };

  const handleReset = (clearFilters, confirm, dataIndex) => {
    clearFilters();
    if (dataIndex === "tag_list") {
      setSearchText([]);
    } else {
      setSearchText("");
    }
    setSearchedColumn("");
    confirm();
  };

  const clearFilters = () => {
    // Reset to current month when clearing filters
    setCurrentDateRange({
      startDate: dayjs().startOf("month"),
      endDate: dayjs().endOf("month"),
    });
    // Reset to first page when clearing filters
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchTransactions();
  };

  // Load data on component mount
  useEffect(() => {
    fetchTransactions();
    fetchTags();
  }, []);

  return {
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
    fetchTransactions,
    fetchTags,
    handleSubmit,
    handleUpdateTransaction,
    handleFilter,
    handleEdit,
    cancelEdit,
    handleTableChange,
    handleSearch,
    handleReset,
    clearFilters,
    setCurrentDateRange,
    setPagination,
  };
};
