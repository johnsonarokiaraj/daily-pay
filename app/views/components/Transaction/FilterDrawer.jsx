import React from "react";
import { Drawer, Form, DatePicker, Select, Button, Space, Divider } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";

const { Option } = Select;

const FullWidthDatePicker = styled(DatePicker)`
  width: 100%;
`;

const FullWidthSelect = styled(Select)`
  width: 100%;
`;

const FilterDrawer = ({ open, onClose, form, onFilter, onClear, tags }) => {
  return (
    <Drawer
      title="Filter"
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
      extra={
        <Space>
          <Button onClick={onClear}>Clear</Button>
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
