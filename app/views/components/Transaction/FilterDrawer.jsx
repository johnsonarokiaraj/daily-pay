import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  DatePicker,
  Select,
  Button,
  Space,
  Divider,
  Modal,
  Input,
  message,
} from "antd";
import { SaveOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styled from "styled-components";
import axios from "axios";

const { Option } = Select;

const FullWidthDatePicker = styled(DatePicker)`
  width: 100%;
`;

const FullWidthSelect = styled(Select)`
  width: 100%;
`;

const FilterDrawer = ({ open, onClose, form, onFilter, onClear, tags }) => {
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [viewName, setViewName] = useState("");
  const [savedViews, setSavedViews] = useState([]);

  // Fetch saved views
  const fetchSavedViews = async () => {
    try {
      const response = await axios.get("/api/views");
      setSavedViews(response.data.views || []);
    } catch (error) {
      console.error("Failed to load saved views");
    }
  };

  // Load saved views when drawer opens
  useEffect(() => {
    if (open) {
      fetchSavedViews();
    }
  }, [open]);

  // Apply a saved view
  const handleApplySavedView = async (viewId) => {
    try {
      const response = await axios.get(`/api/views/${viewId}`);
      const filters = response.data.filters;

      // Set form values
      const formValues = {};
      if (filters.start_date) {
        formValues.start_date = dayjs(filters.start_date, "DD-MM-YYYY");
      }
      if (filters.end_date) {
        formValues.end_date = dayjs(filters.end_date, "DD-MM-YYYY");
      }
      if (filters.tag_list) {
        formValues.tag_list = filters.tag_list.split(",");
      }

      form.setFieldsValue(formValues);
      message.success("View loaded successfully");
    } catch (error) {
      message.error("Failed to load saved view");
    }
  };

  // Save current filters as a view
  const handleSaveView = async () => {
    if (!viewName.trim()) {
      message.error("Please enter a view name");
      return;
    }

    try {
      const formValues = form.getFieldsValue();
      const filters = {};

      // Format the filters
      if (formValues.start_date) {
        filters.start_date = formValues.start_date.format("DD-MM-YYYY");
      }
      if (formValues.end_date) {
        filters.end_date = formValues.end_date.format("DD-MM-YYYY");
      }
      if (formValues.tag_list && formValues.tag_list.length > 0) {
        filters.tag_list = formValues.tag_list.join(",");
      }

      // Save the view
      await axios.post("/api/views", {
        view: {
          name: viewName,
          filters: JSON.stringify(filters),
        },
      });

      message.success("View saved successfully!");
      setIsSaveModalVisible(false);
      setViewName("");
    } catch (error) {
      message.error("Failed to save view");
    }
  };
  return (
    <Drawer
      title="Filter"
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
      extra={
        <Space>
          <Button
            onClick={() => {
              form.resetFields();
              onClear();
            }}
          >
            Clear
          </Button>
          <Button
            type="primary"
            onClick={() => {
              form.submit();
              onClose();
            }}
          >
            Apply
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFilter}>
        {/* Load Saved Views */}
        {savedViews.length > 0 && (
          <>
            <Form.Item label="Load Saved View">
              <Select
                placeholder="Select a saved view..."
                onChange={handleApplySavedView}
                allowClear
              >
                {savedViews.map((view) => (
                  <Option key={view.id} value={view.id}>
                    <Space>
                      <EyeOutlined />
                      {view.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Divider />
          </>
        )}

        <Form.Item name="transaction_name" label="Transaction Name">
          <Input placeholder="Filter by transaction name..." />
        </Form.Item>
        <Form.Item name="start_date" label="Start Date">
          <FullWidthDatePicker format="DD-MM-YYYY" />
        </Form.Item>
        <Form.Item name="end_date" label="End Date">
          <FullWidthDatePicker format="DD-MM-YYYY" />
        </Form.Item>
        <Form.Item name="tag_list" label="Tags">
          <FullWidthSelect
            mode="multiple"
            placeholder="Select tags to filter..."
          >
            {tags.map((tag) => (
              <Option key={tag} value={tag}>
                {tag}
              </Option>
            ))}
          </FullWidthSelect>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default FilterDrawer;
