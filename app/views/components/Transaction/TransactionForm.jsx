import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Space,
  Row,
  Col,
  Switch,
  Badge,
  Tag,
} from "antd";
import { PlusOutlined, FilterOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styled from "styled-components";

const { Option } = Select;

const FormCard = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
    0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  margin-bottom: 16px;
`;

const NoMarginFormItem = styled.div`
  .ant-form-item {
    margin-bottom: 0 !important;
  }
`;

const FullWidthDatePicker = styled(DatePicker)`
  width: 100%;
`;

const FullWidthSelect = styled(Select)`
  width: 100%;
`;

const TagSetContainer = styled.div`
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TagSetItem = styled(Tag)`
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const TransactionForm = ({
  form,
  onSubmit,
  onFilterClick,
  onSaveViewClick,
  hasFiltersApplied,
  hasActiveFilters,
  tags,
  tagSuggestions = [],
}) => {
  const [tagSets, setTagSets] = useState([]);

  // Fetch tag sets when component mounts
  useEffect(() => {
    fetch("/tag_sets.json", {
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setTagSets(data);
      })
      .catch((error) => console.error("Error fetching tag sets:", error));
  }, []);

  // Handle tag set selection
  const handleTagSetClick = (tagSet) => {
    if (tagSet && tagSet.tags) {
      const currentTags = form.getFieldValue("tag_list") || [];
      const newTags = [...new Set([...currentTags, ...tagSet.tags])]; // Remove duplicates
      form.setFieldsValue({ tag_list: newTags });
    }
  };

  return (
    <FormCard>
      <Form
        form={form}
        layout="horizontal"
        onFinish={onSubmit}
        initialValues={{
          transaction_date: dayjs(),
          is_credit: false,
        }}
      >
        <Row gutter={16} align="flex-start">
          <Col xs={12} sm={3}>
            <NoMarginFormItem>
              <Form.Item
                name="transaction_date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <FullWidthDatePicker format="DD-MM-YYYY" />
              </Form.Item>
            </NoMarginFormItem>
          </Col>
          <Col xs={24} sm={5}>
            <NoMarginFormItem>
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Please enter transaction name" },
                ]}
              >
                <Input placeholder="Transaction name" />
              </Form.Item>
            </NoMarginFormItem>
          </Col>
          <Col xs={12} sm={3}>
            <NoMarginFormItem>
              <Form.Item
                name="amount"
                rules={[{ required: true, message: "Please enter amount" }]}
              >
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  prefix="₹"
                />
              </Form.Item>
            </NoMarginFormItem>
          </Col>
          <Col xs={12} sm={2}>
            <NoMarginFormItem>
              <Form.Item
                name="is_credit"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Credit" unCheckedChildren="Credit" />
              </Form.Item>
            </NoMarginFormItem>
          </Col>
          <Col xs={16} sm={7}>
            <Row gutter={[0, 8]}>
              <Col span={24}>
                <NoMarginFormItem>
                  <Form.Item name="tag_list">
                    <FullWidthSelect
                      mode="tags"
                      placeholder="Add tags..."
                      dropdownRender={(menu) => (
                        <>
                          {tagSuggestions && tagSuggestions.length > 0 && (
                            <div
                              style={{
                                padding: "8px 12px",
                                borderBottom: "1px solid #eee",
                                background: "#fafafa",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 500,
                                  color: "#888",
                                  fontSize: 12,
                                }}
                              >
                                Suggestions:{" "}
                              </span>
                              {tagSuggestions.map((tag) => (
                                <span
                                  key={tag}
                                  style={{
                                    display: "inline-block",
                                    background: "#e6f7ff",
                                    color: "#1677ff",
                                    borderRadius: 4,
                                    padding: "2px 8px",
                                    marginRight: 6,
                                    fontSize: 12,
                                    cursor: "pointer",
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    const current =
                                      form.getFieldValue("tag_list") || [];
                                    if (!current.includes(tag)) {
                                      form.setFieldsValue({
                                        tag_list: [...current, tag],
                                      });
                                    }
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {menu}
                        </>
                      )}
                    >
                      {tags.map((tag) => (
                        <Option key={tag} value={tag}>
                          {tag}
                        </Option>
                      ))}
                    </FullWidthSelect>
                  </Form.Item>
                </NoMarginFormItem>
              </Col>
              <Col span={24}>
                <TagSetContainer>
                  {tagSets.map((tagSet) => (
                    <TagSetItem
                      key={tagSet.id}
                      color="blue"
                      onClick={() => handleTagSetClick(tagSet)}
                    >
                      {tagSet.name}
                    </TagSetItem>
                  ))}
                </TagSetContainer>
              </Col>
            </Row>
          </Col>
          <Col xs={8} sm={4}>
            <Space>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Add
              </Button>
              <Badge dot={hasActiveFilters} color="#1890ff">
                <Button icon={<FilterOutlined />} onClick={onFilterClick} />
              </Badge>
              <Button
                id="save-filter"
                icon={<SaveOutlined />}
                onClick={onSaveViewClick}
                disabled={!hasFiltersApplied}
                title={
                  hasFiltersApplied
                    ? "Save current filters as view"
                    : "Apply filters first to save a view"
                }
              />
            </Space>
          </Col>
        </Row>
      </Form>
    </FormCard>
  );
};

export default TransactionForm;
