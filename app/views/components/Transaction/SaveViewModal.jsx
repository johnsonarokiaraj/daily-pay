import React, { useState } from "react";
import { Modal, Input, message, Space } from "antd";
import axios from "axios";

const SaveViewModal = ({ open, onClose, appliedFilters }) => {
  const [viewName, setViewName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveView = async () => {
    if (!viewName.trim()) {
      message.error("Please enter a view name");
      return;
    }

    if (!appliedFilters || Object.keys(appliedFilters).length === 0) {
      message.error("No filters applied to save");
      return;
    }

    setLoading(true);
    try {
      const filters = {};

      // Format the filters
      if (appliedFilters.start_date) {
        filters.start_date = appliedFilters.start_date.format("DD-MM-YYYY");
      }
      if (appliedFilters.end_date) {
        filters.end_date = appliedFilters.end_date.format("DD-MM-YYYY");
      }
      if (appliedFilters.tag_list && appliedFilters.tag_list.length > 0) {
        filters.tag_list = appliedFilters.tag_list.join(",");
      }

      // Save the view
      await axios.post("/api/views", {
        view: {
          name: viewName,
          filters: JSON.stringify(filters),
        },
      });

      message.success("View saved successfully!");
      onClose();
      setViewName("");
    } catch (error) {
      message.error("Failed to save view");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setViewName("");
  };

  return (
    <Modal
      title="Save Filter as View"
      open={open}
      onOk={handleSaveView}
      onCancel={handleClose}
      okText="Save"
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>Give your filter configuration a name:</div>
        <Input
          placeholder="Enter view name (e.g., 'Work Expenses Q1')"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          onPressEnter={handleSaveView}
        />
      </Space>
    </Modal>
  );
};

export default SaveViewModal;
