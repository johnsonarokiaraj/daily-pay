import React, { useState, useEffect } from "react";
import { Select, Button, Switch, Form, Space, Typography } from "antd";
import axios from "axios";

const { Option } = Select;
const { Title } = Typography;

const TransactionTagUpdater = () => {
  const [tags, setTags] = useState([]);
  const [conditionTag, setConditionTag] = useState(null);
  const [conditionType, setConditionType] = useState("present"); // "present" or "absent"
  const [newTags, setNewTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Fetch all available tags
    axios.get("/api/tags")
      .then((res) => {
        let tagArray = Array.isArray(res.data) ? res.data : res.data.tags;
        if (!Array.isArray(tagArray)) tagArray = [];
        setTags(tagArray);
        console.log("/api/tags response:", tagArray);
      })
      .catch((err) => {
        console.error("Error fetching /api/tags:", err);
      });
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post("/api/transaction_tag_updater", {
        condition_tag: conditionTag,
        condition_type: conditionType,
        new_tags: newTags,
      });
      setResult(response.data);
    } catch (err) {
      setResult({ error: "Failed to update transaction tags." });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Transaction Tag Updater</Title>
      <Form layout="vertical">
        <Form.Item label="Condition Tag">
          <Select
            showSearch
            mode="tags"
            placeholder="Select or type a tag to check"
            value={conditionTag}
            onChange={setConditionTag}
            style={{ width: 300 }}
          >
            {tags.map((tag) => (
              <Option key={tag.id} value={tag.name}>{tag.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Condition Type">
          <Switch
            checkedChildren="Present"
            unCheckedChildren="Absent"
            checked={conditionType === "present"}
            onChange={(checked) => setConditionType(checked ? "present" : "absent")}
          />
        </Form.Item>
        <Form.Item label="New Tags to Add">
          <Select
            mode="tags"
            placeholder="Add tags..."
            value={newTags}
            onChange={setNewTags}
            style={{ width: 300 }}
          >
            {tags.map((tag) => (
              <Option key={tag.id} value={tag.name}>{tag.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleUpdate} loading={loading} disabled={!conditionTag || newTags.length === 0}>
            Update Transaction Tags
          </Button>
        </Form.Item>
      </Form>
      {result && (
        <div style={{ marginTop: 16 }}>
          {result.error ? (
            <Typography.Text type="danger">{result.error}</Typography.Text>
          ) : (
            <Typography.Text type="success">{result.message || "Tags updated successfully."}</Typography.Text>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionTagUpdater;
