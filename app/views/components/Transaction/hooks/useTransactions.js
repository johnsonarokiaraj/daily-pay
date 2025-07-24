import { useState, useEffect, useMemo } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import axios from "axios";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState({ count: 0, credit: 0, debit: 0 });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  // State for tracking applied filters
  const [appliedFilters, setAppliedFilters] = useState({});

  // State to track if filters were loaded from a saved view (vs manually applied)
  const [isLoadedFromSavedView, setIsLoadedFromSavedView] = useState(false);

  // State for tracking current filters that are active
  const [currentFilters, setCurrentFilters] = useState({});

  // State for tracking current date range filter
  const [currentDateRange, setCurrentDateRange] = useState({
    startDate: dayjs().startOf("month"),
    endDate: dayjs().endOf("month"),
  });

  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    total_count: 0,
    total_pages: 0,
    has_more: false
  });

  const fetchTransactions = async (filters = {}) => {
    // Reset pagination when fetching new data

    if (filters.page !== undefined) {
      filters.page = filters.page; // Use current page if not specified  
      setLoadingMore(true);
    } else {
      setLoading(true);
      filters.page = pagination.page;
    }
    filters.page_size = filters.page_size || 10; // Default to 10 items per page

    try {
      const response = await axios.get("/api/transactions", {
        params: filters,
      });

      if (response.data.transactions) {
        setTransactions(filters.page === 1 ? response.data.transactions : [...transactions, ...response.data.transactions]);
        setStats({
          count: filters.page === 1 ? response.data.transactions.length : [...transactions, ...response.data.transactions].length,
          credit: response.data.credit || 0,
          debit: response.data.debit || 0,
        });

        setPagination({
          ...response.data.pagination,
        });
      }
    } catch (error) {
      message.error("Failed to load transactions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
        tag_list: values.tag_list || [], // Send as array, not string
        is_credit: values.is_credit || false,
      };

      const response = await axios.post("/api/transactions", { transaction: data });
      message.success("Transaction added successfully");
      if (response.data.transaction && response.data.status === "success") {
        // Add the new transaction to the list
        setTransactions((prev) => [response.data.transaction, ...prev]);
      }
      return true; // Success indicator
    } catch (error) {
      message.error("Failed to save transaction");
      return false;
    }
  };

  const handleUpdateTransaction = async (values) => {
    console.log('=== handleUpdateTransaction called ===');
    console.log('Input values:', values);

    try {
      const transactionId = values.id || (editingTransaction && editingTransaction.id);
      console.log('Transaction ID:', transactionId);

      if (!transactionId) {
        console.error('No transaction ID provided');
        message.error("No transaction ID provided");
        return false;
      }

      const data = {
        ...values,
        transaction_date: values.transaction_date && values.transaction_date.format
          ? values.transaction_date.format("DD-MM-YYYY")
          : values.transaction_date,
        tag_list:
          Array.isArray(values.tag_list)
            ? values.tag_list
            : (typeof values.tag_list === "string" ? values.tag_list.split(",").map(t => t.trim()).filter(Boolean) : []),
        is_credit: values.is_credit || false,
      };

      console.log('Processed data before API call:', data);

      const apiPayload = {
        transaction: {
          ...data,
          tag_list: data.tag_list // Send as array, not string
        },
      };

      console.log('API payload:', apiPayload);
      console.log('Making PATCH request to:', `/api/transactions/${transactionId}`);

      await axios.patch(`/api/transactions/${transactionId}`, apiPayload);

      console.log('API call successful');
      message.success("Transaction updated successfully");

      setEditingTransaction(null);
      fetchTransactions(currentFilters);
      return true;
    } catch (error) {
      console.error('Error in handleUpdateTransaction:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      message.error("Failed to update transaction");
      return false;
    }
  };

  const handleFilter = (values, fromSavedView = false) => {
    const filters = {};
    if (values.start_date)
      filters.start_date = values.start_date.format("DD-MM-YYYY");
    if (values.end_date)
      filters.end_date = values.end_date.format("DD-MM-YYYY");
    if (values.tag_list && values.tag_list.length)
      filters.tag_list = values.tag_list.join(",");
    if (values.transaction_name)
      filters.transaction_name = values.transaction_name;

    // Set allow_date flag based on whether dates are provided
    if (values.start_date || values.end_date) {
      filters.allow_date = "1";
    } else {
      filters.allow_date = "0";
    }

    // Store current filters for preserving them after CRUD operations
    setCurrentFilters(filters);

    // Store applied filters for enabling/disabling save button
    setAppliedFilters(values);

    // Track if this was loaded from a saved view
    setIsLoadedFromSavedView(fromSavedView);

    // Update current date range state
    setCurrentDateRange({
      startDate: values.start_date || dayjs().startOf("month"),
      endDate: values.end_date || dayjs().endOf("month"),
    });

    // Reset to first page when applying filters
    fetchTransactions({ ...filters, page: 1 }); // Ensure page size is set
  };

  const handleEdit = (record) => {
    console.log("Editing record:", record);
    console.log("Original date:", record.transaction_date);

    setEditingTransaction(record);
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
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
  }; const clearFilters = () => {
    // Clear applied filters state
    setAppliedFilters({});

    // Clear current filters
    setCurrentFilters({});

    // Reset saved view flag
    setIsLoadedFromSavedView(false);

    // Reset to current month when clearing filters
    setCurrentDateRange({
      startDate: dayjs().startOf("month"),
      endDate: dayjs().endOf("month"),
    });
    // Reset to first page when clearing filters
    fetchTransactions({ page: 1 });
  };

  // Check if any filters are currently applied and not from a saved view
  const hasFiltersApplied = () => {
    if (!appliedFilters || isLoadedFromSavedView) return false;

    return !!(
      appliedFilters.start_date ||
      appliedFilters.end_date ||
      (appliedFilters.tag_list && appliedFilters.tag_list.length > 0)
    );
  };

  // Check if any filters are currently active (regardless of source)
  const hasActiveFilters = () => {
    if (!appliedFilters) return false;

    return !!(
      appliedFilters.start_date ||
      appliedFilters.end_date ||
      (appliedFilters.tag_list && appliedFilters.tag_list.length > 0)
    );
  };

  // Tag suggestions based on previous transactions
  const tagSuggestions = useMemo(() => {
    const tagCount = {};
    transactions.forEach((tx) => {
      if (Array.isArray(tx.tag_list)) {
        tx.tag_list.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      } else if (typeof tx.tag_list === "string" && tx.tag_list) {
        // If tag_list is a comma-separated string
        tx.tag_list.split(",").forEach((tag) => {
          tag = tag.trim();
          if (tag) tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    // Sort tags by frequency, descending
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [transactions]);

  // Load data on component mount
  useEffect(() => {
    fetchTransactions();
    fetchTags();

    // Check URL parameters for applying a saved view
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.size > 0) {
      const filters = {};
      urlParams.forEach((value, key) => {
        filters[key] = value;
      });

      // Apply the filters from URL (mark as loaded from saved view)
      setTimeout(() => {
        handleFilter({
          start_date: filters.start_date ? dayjs(filters.start_date, "DD-MM-YYYY") : null,
          end_date: filters.end_date ? dayjs(filters.end_date, "DD-MM-YYYY") : null,
          tag_list: filters.tag_list ? filters.tag_list.split(",") : null,
        }, true);
      }, 500); // Small delay to ensure tags are loaded
    }
  }, []);

  // Apply saved view by ID
  const applySavedView = async (viewId) => {
    try {
      const response = await axios.get(`/api/views/${viewId}`);
      const filters = response.data.filters;

      // Convert filters to form format
      const formFilters = {
        start_date: filters.start_date ? dayjs(filters.start_date, "DD-MM-YYYY") : null,
        end_date: filters.end_date ? dayjs(filters.end_date, "DD-MM-YYYY") : null,
        tag_list: filters.tag_list ? filters.tag_list.split(",") : null,
      };

      // Apply the filters (mark as loaded from saved view)
      handleFilter(formFilters, true);
      message.success("View applied successfully");
    } catch (error) {
      message.error("Failed to apply saved view");
    }
  };

  return {
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
    currentFilters,

    // Actions
    fetchTransactions,
    fetchTags,
    handleSubmit,
    handleUpdateTransaction,
    handleFilter,
    handleEdit,
    cancelEdit,
    handleSearch,
    handleReset,
    clearFilters,
    setCurrentDateRange,
    setPagination,
    applySavedView,
    hasFiltersApplied,
    hasActiveFilters,
    tagSuggestions,
  };
};
