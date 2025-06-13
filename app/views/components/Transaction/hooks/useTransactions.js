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

      // Preserve current filters when refreshing data
      fetchTransactions(currentFilters);
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

      // Preserve current filters when refreshing data
      fetchTransactions(currentFilters);
      return true;
    } catch (error) {
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
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchTransactions();
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
    handleTableChange,
    handleSearch,
    handleReset,
    clearFilters,
    setCurrentDateRange,
    setPagination,
    applySavedView,
    hasFiltersApplied,
    hasActiveFilters,
  };
};
