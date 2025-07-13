import React, { useEffect, useState } from "react";
import { Card, Typography, Tag, Spin, Button, message, Collapse, Dropdown, Menu, Space, Form } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import { BarChartOutlined, PieChartOutlined, DownOutlined, AreaChartOutlined, EditOutlined } from '@ant-design/icons';
import { FaChartBar } from 'react-icons/fa';
import ChartJSPie from '../ChartJSPie';
import TransactionEditModal from './TransactionEditModal';
import TagInsightsBoardEditModal from './TagInsightsBoardEditModal';
import { formatIndianCurrency } from '../../../javascript/utils/indianCurrency';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function TagInsightsBoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainTagChart, setMainTagChart] = useState(null);
  const [subTagCharts, setSubTagCharts] = useState({});

  // Edit functionality state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [tags, setTags] = useState([]);
  const [editForm] = Form.useForm();

  // Board edit functionality state
  const [isBoardEditModalVisible, setIsBoardEditModalVisible] = useState(false);
  const [boardEditForm] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tag_insights_boards/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load board");
        return res.json();
      })
      .then((data) => {
        setBoard(data.board || data); // support both {board: ...} and direct
        setInsights(data.flattened || []);
        setLoading(false);
      })
      .catch(() => {
        message.error("Failed to load board");
        setLoading(false);
      });
  }, [id]);

  // Group sub_tag rows and their transactions
  const subTagGroups = [];
  let currentSubTag = null;
  insights.forEach((row, idx) => {
    if (row.type === "sub_tag") {
      currentSubTag = { subTag: row, transactions: [] };
      subTagGroups.push(currentSubTag);
    } else if (row.type === "transaction" && currentSubTag) {
      currentSubTag.transactions.push(row);
    }
  });

  // Generate time series data for charts (last 12 months)
  const generateTimeSeriesData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      console.log('No transactions for time series chart');
      return [];
    }
    
    console.log('Generating time series from transactions:', transactions.length);
    
    // Group by month
    const monthlyData = {};
    transactions.forEach(tx => {
      try {
        const date = new Date(tx.date);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[month]) {
          monthlyData[month] = { month, sum: 0, count: 0 };
        }
        const amount = tx.amount ? parseFloat(tx.amount) : 0;
        monthlyData[month].sum += amount;
        monthlyData[month].count += 1;
      } catch (err) {
        console.error('Error processing transaction for chart:', tx, err);
      }
    });
    
    // Convert to array and sort by date
    const result = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    console.log('Time series data generated:', result);
    
    // If no data points, add dummy point to prevent chart errors
    if (result.length === 0) {
      const currentMonth = new Date().toISOString().substr(0, 7);
      result.push({ month: currentMonth, sum: 0, count: 0 });
    }
    
    return result;
  };

  // Generate pie chart data for sub-tag distribution
  const generatePieData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      console.log('No transactions for pie chart');
      // Return a placeholder dataset to prevent chart errors
      return [{tag: 'No Data', value: 1}];
    }
    
    console.log('Generating pie chart from transactions:', transactions.length);
    
    // Group by tag
    const tagData = {};
    transactions.forEach(tx => {
      try {
        if (tx.tags && Array.isArray(tx.tags)) {
          tx.tags.forEach(tag => {
            if (!tagData[tag]) {
              tagData[tag] = { tag, value: 0 };
            }
            const amount = tx.amount ? Math.abs(parseFloat(tx.amount)) : 0;
            tagData[tag].value += amount;
          });
        } else {
          // If no tags, add to 'Untagged' category
          if (!tagData['Untagged']) {
            tagData['Untagged'] = { tag: 'Untagged', value: 0 };
          }
          const amount = tx.amount ? Math.abs(parseFloat(tx.amount)) : 0;
          tagData['Untagged'].value += amount;
        }
      } catch (err) {
        console.error('Error processing transaction for pie chart:', tx, err);
      }
    });
    
    const result = Object.values(tagData);
    console.log('Pie chart data generated:', result);
    
    // If no data points, add dummy point to prevent chart errors
    if (result.length === 0) {
      result.push({ tag: 'No Data', value: 1 });
    }
    
    return result;
  };

  // Handle chart selection for main tag
  const handleMainTagChart = (type) => {
    let chartTypeObj = typeof type === 'string' ? { type } : type;
    setMainTagChart(chartTypeObj);
    setTimeout(() => {
      const chartData = chartTypeObj.type === 'area'
        ? generateTimeSeriesData(allTransactions)
        : generatePieData(allTransactions);
      console.log('Chart data:', chartData);
    }, 100);
  };

  // Handle chart selection for sub tag
  const handleSubTagChart = (tag, type) => {
    console.log(`Generating ${type} chart for ${tag}...`);
    setSubTagCharts(prev => ({
      ...prev,
      [tag]: type
    }));
    // Find the transactions for this sub-tag
    const group = subTagGroups.find(g => g.subTag.tag === tag);
    if (group) {
      setTimeout(() => {
        const chartData = type === 'area' 
          ? generateTimeSeriesData(group.transactions) 
          : generatePieData(group.transactions);
        console.log(`Chart data for ${tag}:`, chartData);
      }, 100);
    }
  };

  // Edit functionality
  const handleEditTransaction = (transaction) => {
    console.log('Editing transaction:', transaction);
    setEditingTransaction(transaction);
    setIsEditModalVisible(true);

    // Pre-populate the edit form
    editForm.setFieldsValue({
      id: transaction.id,
      name: transaction.name,
      amount: Math.abs(parseFloat(transaction.amount)),
      transaction_date: dayjs(transaction.date),
      tag_list: transaction.tags || [],
      is_credit: parseFloat(transaction.amount) >= 0,
    });
  };

  const handleEditModalSubmit = async (values) => {
    try {
      const payload = {
        transaction: {
          ...values,
          transaction_date: values.transaction_date.format("DD-MM-YYYY"),
          tag_list: values.tag_list || [],
        },
      };

      await axios.patch(`/api/transactions/${editingTransaction.id}`, payload);
      message.success("Transaction updated successfully");

      setIsEditModalVisible(false);
      setEditingTransaction(null);
      editForm.resetFields();

      // Refresh the board data
      window.location.reload();
    } catch (error) {
      console.error('Error updating transaction:', error);
      message.error("Failed to update transaction");
    }
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setEditingTransaction(null);
    editForm.resetFields();
  };

  // Fetch tags for the edit modal
  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => {
        if (data.tags) {
          setTags(data.tags.map(tag => tag.name));
        }
      })
      .catch(err => console.error('Error fetching tags:', err));
  }, []);

  // Board edit functionality
  const handleEditBoard = () => {
    setIsBoardEditModalVisible(true);
    // Pre-populate the board edit form
    boardEditForm.setFieldsValue({
      name: board.name,
      main_tag: board.main_tag,
      sub_tags: Array.isArray(board.sub_tags) ? board.sub_tags : [],
    });
  };

  const handleBoardEditModalSubmit = async (values) => {
    try {
      const payload = {
        tag_insights_board: {
          ...values,
          sub_tags: values.sub_tags || [],
        },
      };

      console.log('Sending payload:', payload); // Debug log
      await axios.patch(`/api/tag_insights_boards/${id}`, payload);
      message.success("Board updated successfully");

      setIsBoardEditModalVisible(false);
      boardEditForm.resetFields();

      // Refresh the board data
      window.location.reload();
    } catch (error) {
      console.error('Error updating board:', error);
      console.error('Response data:', error.response && error.response.data); // Debug log

      // Show specific error message if available
      const errorMessage = error.response && error.response.data && error.response.data.errors
        ? error.response.data.errors.join(', ')
        : "Failed to update board";
      message.error(errorMessage);
    }
  };

  const handleBoardEditModalCancel = () => {
    setIsBoardEditModalVisible(false);
    boardEditForm.resetFields();
  };

  if (loading) return <Spin style={{ margin: 48 }} />;
  if (!board) return <div style={{ padding: 24 }}>Board not found.</div>;

  // Find the main tag data
  const mainTagData = insights.find(row => row.type === "main_tag");
  const allTransactions = [].concat(...subTagGroups.map(group => group.transactions));
  
  // Chart menu items for dropdown
  const getChartMenu = (tag, isSubTag = false) => (
    <Menu>
      <Menu.Item key="pie" icon={<PieChartOutlined />} onClick={() => isSubTag ? handleSubTagChart(tag, 'pie') : handleMainTagChart('pie')}>
        Tag Distribution (Pie Chart)
      </Menu.Item>
      <Menu.SubMenu key="bar" icon={<FaChartBar />} title="Spending Over Time (Bar Graph)">
        <Menu.Item key="bar-daily" onClick={() => isSubTag ? handleSubTagChart(tag, { type: 'bar', range: 'daily' }) : handleMainTagChart({ type: 'bar', range: 'daily' })}>Daily</Menu.Item>
        <Menu.Item key="bar-weekly" onClick={() => isSubTag ? handleSubTagChart(tag, { type: 'bar', range: 'weekly' }) : handleMainTagChart({ type: 'bar', range: 'weekly' })}>Weekly</Menu.Item>
        <Menu.Item key="bar-monthly" onClick={() => isSubTag ? handleSubTagChart(tag, { type: 'bar', range: 'monthly' }) : handleMainTagChart({ type: 'bar', range: 'monthly' })}>Monthly</Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );

  // Chart dropdown for main tag
  const mainTagChartDropdown = (
    <Dropdown 
      overlay={getChartMenu(mainTagData && mainTagData.tag ? mainTagData.tag : 'All')}
      placement="bottomRight"
      trigger={["click"]}
    >
      <Button
        type="primary"
        icon={<FaChartBar style={{ fontSize: 16, color: mainTagChart && mainTagChart.type === 'bar' ? '#1677ff' : '#8c8c8c' }} />}
        style={{ background: mainTagChart && mainTagChart.type === 'bar' ? '#f0f5ff' : '#fff', color: mainTagChart && mainTagChart.type === 'bar' ? '#1677ff' : '#8c8c8c', fontWeight: 500, display: 'flex', alignItems: 'center', marginLeft: 10 }}
      >
        Bar Graph <DownOutlined style={{ fontSize: 12, marginLeft: 5 }} />
      </Button>
    </Dropdown>
  );

  // Chart dropdown for main tag (for icon in header)
  const mainTagChartIconDropdown = (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item key="bar-daily" onClick={() => handleMainTagChart({ type: 'bar', range: 'daily' })}>Daily</Menu.Item>
          <Menu.Item key="bar-weekly" onClick={() => handleMainTagChart({ type: 'bar', range: 'weekly' })}>Weekly</Menu.Item>
          <Menu.Item key="bar-monthly" onClick={() => handleMainTagChart({ type: 'bar', range: 'monthly' })}>Monthly</Menu.Item>
        </Menu>
      }
      placement="bottomRight"
      trigger={["click"]}
    >
      <BarChartOutlined
        style={{
          fontSize: 16,
          color: mainTagChart && mainTagChart.type === 'bar' ? '#1677ff' : '#8c8c8c',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: 4,
          background: mainTagChart && mainTagChart.type === 'bar' ? '#f0f5ff' : 'transparent'
        }}
        title="Bar Chart"
        onClick={e => e.stopPropagation()}
      />
    </Dropdown>
  );

  // Chart rendering for main tag
  const renderMainTagChart = () => {
    if (!mainTagChart) return null;
    if (mainTagChart.type === 'bar') {
      let data = generateTimeSeriesData(allTransactions);
      if (mainTagChart.range === 'weekly') {
        // Group by week
        const grouped = {};
        data.forEach(d => {
          const week = new Date(d.month + '-01');
          week.setDate(week.getDate() - week.getDay());
          const weekStr = week.toISOString().slice(0, 10);
          if (!grouped[weekStr]) grouped[weekStr] = [];
          grouped[weekStr].push(d);
        });
        data = Object.entries(grouped).map(([date, arr]) => ({
          month: date,
          sum: arr[arr.length-1].sum
        }));
      } else if (mainTagChart.range === 'monthly') {
        // Already monthly
      } else {
        // Daily
        // If you have daily data, use it here. For now, fallback to monthly.
      }
      const chartData = {
        labels: data.map(d => d.month),
        datasets: [
          {
            label: 'Amount',
            data: data.map(d => d.sum),
            backgroundColor: '#1677ff',
            borderRadius: 6,
            barPercentage: 0.6,
          },
        ],
      };
      const options = {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `₹${ctx.parsed.y}`,
            },
          },
          title: {
            display: true,
            text: `Spending Over Time (${mainTagChart.range.charAt(0).toUpperCase() + mainTagChart.range.slice(1)})`,
            color: '#222',
            font: { size: 18, weight: 'bold' },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
        },
      };
      return (
        <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', marginBottom: 24 }}>
          <Bar data={chartData} options={options} height={300} />
        </div>
      );
    } else if (mainTagChart.type === 'pie') {
      // Generate separate credit and debit data for main tag
      const creditData = [];
      const debitData = [];

      subTagGroups.forEach(group => {
        if (group.subTag.credit_sum && parseFloat(group.subTag.credit_sum) > 0) {
          creditData.push({
            tag: group.subTag.tag,
            value: parseFloat(group.subTag.credit_sum)
          });
        }
        if (group.subTag.debit_sum && parseFloat(group.subTag.debit_sum) > 0) {
          debitData.push({
            tag: group.subTag.tag,
            value: Math.abs(parseFloat(group.subTag.debit_sum))
          });
        }
      });

      console.log('Credit/Debit pie charts data ready:', { creditData, debitData });

      return (
        <div style={{ display: 'flex', gap: 20, marginTop: 16, marginBottom: 20 }}>
          {/* Credit Pie Chart */}
          <Card
            title={
              <span style={{ color: '#059669', fontWeight: 600 }}>
                ��� Credit Distribution
              </span>
            }
            style={{ flex: 1, borderRadius: 8, border: '1px solid #d1fae5' }}
          >
            <ChartJSPie data={creditData} title={null} />
          </Card>

          {/* Debit Pie Chart */}
          <Card
            title={
              <span style={{ color: '#dc2626', fontWeight: 600 }}>
                💸 Debit Distribution
              </span>
            }
            style={{ flex: 1, borderRadius: 8, border: '1px solid #fecaca' }}
          >
            <ChartJSPie data={debitData} title={null} />
          </Card>
        </div>
      );
    }
    return null;
  };

  const items = subTagGroups.map((group, idx) => {
    const subTagChartType = subTagCharts[group.subTag.tag];
    
    return {
      key: group.subTag.tag + idx,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{
              color: '#2b3a55',
              fontWeight: 600,
              fontSize: 16,
              minWidth: 120
            }}>
              {group.subTag.tag}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                color: '#166534',
                fontWeight: 600,
                fontSize: '14px'
              }}>
                Credit: {formatIndianCurrency(group.subTag.credit_sum || 0)}
              </span>
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>|</span>
              <span style={{
                color: '#991b1b',
                fontWeight: 600,
                fontSize: '14px'
              }}>
                Debit: {formatIndianCurrency(Math.abs(group.subTag.debit_sum || 0))}
              </span>
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>|</span>
              <span style={{
                color: '#1e40af',
                fontWeight: 700,
                fontSize: '14px'
              }}>
                Balance: {formatIndianCurrency(group.subTag.balance || 0)}
              </span>
            </div>
          </div>
          <Dropdown
            overlay={getChartMenu(group.subTag.tag || '', true)}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button 
              type="text" 
              icon={<FaChartBar />}
              size="small"
              style={{ color: '#1677ff', marginLeft: 8 }}
            >
              Visualize <DownOutlined style={{ fontSize: 10, marginLeft: 3 }} />
            </Button>
          </Dropdown>
        </div>
      ),
      children: (
        <div>
          {group.transactions.length === 0 ? (
            <div style={{ color: '#888', fontSize: 15 }}>No transactions.</div>
          ) : (
            <>
              {group.transactions.map((row, tIdx) => (
                <Card
                  key={tIdx}
                  size="small"
                  style={{ marginBottom: 10, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  bodyStyle={{ padding: 12, display: 'flex', alignItems: 'center', gap: 16 }}
                >
                  <span style={{ color: '#888', minWidth: 90 }}>{row.date}</span>
                  <span style={{ fontWeight: 500, flex: 1 }}>{row.name}</span>
                  <span style={{ color: row.amount >= 0 ? '#16a34a' : '#d32f2f', fontWeight: 600, minWidth: 80, textAlign: 'right' }}>
                    ₹{row.amount}
                  </span>
                  <span>
                    {row.tags && row.tags.map((tag) => (
                      <Tag key={tag} color="purple" style={{ marginRight: 4 }}>{tag}</Tag>
                    ))}
                  </span>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditTransaction(row)}
                    title="Edit Transaction"
                    style={{ color: '#1677ff' }}
                  />
                </Card>
              ))}
              
              {/* Sub-tag chart */}
              {subTagChartType === 'bar' && (
                <div style={{ marginTop: 20, marginBottom: 12 }}>
                  <Card
                    size="small"
                    title={
                      <span style={{ color: '#1677ff', fontWeight: 600 }}>
                        📊 Spending Over Time: {group.subTag.tag}
                      </span>
                    }
                    style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                  >
                    {(() => {
                      // Group transactions by selected range for both credit and debit
                      let monthlyData = {};
                      group.transactions.forEach(tx => {
                        const date = new Date(tx.date);
                        let key;
                        if (subTagChartType.range === 'daily') {
                          key = date.toISOString().slice(0, 10);
                        } else if (subTagChartType.range === 'weekly') {
                          const weekStart = new Date(date);
                          weekStart.setDate(date.getDate() - date.getDay());
                          key = weekStart.toISOString().slice(0, 10);
                        } else {
                          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        }
                        if (!monthlyData[key]) {
                          monthlyData[key] = { key, credit: 0, debit: 0 };
                        }
                        const amount = tx.amount ? parseFloat(tx.amount) : 0;
                        if (amount >= 0) {
                          monthlyData[key].credit += amount;
                        } else {
                          monthlyData[key].debit += Math.abs(amount);
                        }
                      });
                      const data = Object.values(monthlyData).sort((a, b) => a.key.localeCompare(b.key));
                      const chartData = {
                        labels: data.map(d => d.key),
                        datasets: [
                          {
                            label: 'Credit',
                            data: data.map(d => d.credit),
                            backgroundColor: '#16a34a',
                            borderRadius: 6,
                            barPercentage: 0.6,
                          },
                          {
                            label: 'Debit',
                            data: data.map(d => d.debit),
                            backgroundColor: '#d32f2f',
                            borderRadius: 6,
                            barPercentage: 0.6,
                          },
                        ],
                      };
                      const options = {
                        responsive: true,
                        plugins: {
                          legend: { display: true },
                          tooltip: {
                            callbacks: {
                              label: ctx => `₹${ctx.parsed.y}`,
                            },
                          },
                          title: {
                            display: true,
                            text: `Spending Over Time (Credit vs Debit)` ,
                            color: '#222',
                            font: { size: 16, weight: 'bold' },
                          },
                        },
                        scales: {
                          x: { grid: { display: false } },
                          y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                        },
                      };
                      return <Bar data={chartData} options={options} height={220} />;
                    })()}
                  </Card>
                </div>
              )}
              
              {subTagChartType === 'pie' && (
                <div style={{ marginTop: 16, marginBottom: 12 }}>
                  <Card size="small" title={`Tag Distribution: ${group.subTag.tag}`}>
                    <ChartJSPie data={generatePieData(group.transactions)} title={null} />
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      ),
    };
  });

  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 16, background: '#f0f5ff', color: '#1677ff', border: 'none', fontWeight: 500 }}>
        &larr; Back
      </Button>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0, color: '#1677ff', fontWeight: 700 }}>{board.name}</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <Tag color="blue" style={{ fontSize: 16, padding: '4px 16px', borderRadius: 6 }}>Main: {board.main_tag}</Tag>
              {Array.isArray(board.sub_tags) && board.sub_tags.length > 0 && (
                <span style={{ marginLeft: 8 }}>
                  {board.sub_tags.map(tag => (
                    <Tag key={tag} color="geekblue" style={{ fontSize: 15, borderRadius: 6 }}>{tag}</Tag>
                  ))}
                </span>
              )}
            </div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditBoard}
              size="middle"
              style={{
                background: '#1677ff',
                borderColor: '#1677ff',
                borderRadius: 6,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              Edit Board
            </Button>
          </div>
        </div>
        <div style={{ marginBottom: 24, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
          <Title level={4} style={{ margin: 0, color: '#444' }}>Summary</Title>
        </div>
        {insights.length === 0 ? (
          <div style={{ color: '#888', fontSize: 16 }}>No data.</div>
        ) : (
          <div>
            {/* Main tag summary with visualization dropdown */}
            {insights.map((row, idx) => (
              row.type === "main_tag" ? (
                <div key={idx}>
                  <Collapse accordion style={{ background: 'transparent', marginBottom: 16 }}>
                    <Collapse.Panel
                      key="main-tag"
                      header={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{
                              color: '#2b3a55',
                              fontWeight: 600,
                              fontSize: 16,
                              minWidth: 120
                            }}>
                              {row.tag}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                                color: '#389e0d',
                                borderRadius: '6px',
                                padding: '4px 12px',
                                fontWeight: 600,
                                fontSize: '13px',
                                border: '1px solid #b7eb8f',
                                boxShadow: '0 1px 3px rgba(56, 158, 13, 0.1)'
                              }}>
                                💰 ₹{row.credit_sum || 0}
                              </span>
                              <span style={{
                                background: 'linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)',
                                color: '#cf1322',
                                borderRadius: '6px',
                                padding: '4px 12px',
                                fontWeight: 600,
                                fontSize: '13px',
                                border: '1px solid #ffccc7',
                                boxShadow: '0 1px 3px rgba(207, 19, 34, 0.1)'
                              }}>
                                💸 ₹{Math.abs(row.debit_sum || 0)}
                              </span>
                              <span style={{
                                background: 'linear-gradient(135deg, #f0f5ff 0%, #d6e4ff 100%)',
                                color: '#1677ff',
                                borderRadius: '6px',
                                padding: '4px 12px',
                                fontWeight: 700,
                                fontSize: '14px',
                                border: '1px solid #adc6ff',
                                boxShadow: '0 2px 4px rgba(22, 119, 255, 0.15)',
                                minWidth: 80,
                                textAlign: 'center'
                              }}>
                                📊 ₹{row.sum || 0}
                              </span>
                              <span style={{
                                background: '#fafafa',
                                color: '#595959',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                border: '1px solid #d9d9d9',
                                fontWeight: 500
                              }}>
                                {row.count} txns
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {mainTagChartIconDropdown}
                            <PieChartOutlined
                              style={{
                                fontSize: 16,
                                color: mainTagChart && mainTagChart.type === 'pie' ? '#1677ff' : '#8c8c8c',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: 4,
                                background: mainTagChart && mainTagChart.type === 'pie' ? '#f0f5ff' : 'transparent'
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                handleMainTagChart({ type: 'pie' });
                              }}
                              title="Pie Chart"
                            />
                          </div>
                        </div>
                      }
                      style={{
                        marginBottom: 12,
                        borderRadius: 8,
                        border: '1px solid #e8e8e8',
                        background: '#fafafa'
                      }}
                    >
                      <div style={{ padding: '8px 0' }}>
                        {renderMainTagChart()}

                        {/* Sub tags collapsible */}
                        <Collapse accordion style={{ background: 'transparent', marginTop: 16 }}>
                          {subTagGroups.map((group, subIdx) => {
                            const subTagChartType = subTagCharts[group.subTag.tag];

                            return (
                              <Collapse.Panel
                                key={group.subTag.tag + subIdx}
                                header={
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                      <span style={{
                                        color: '#2b3a55',
                                        fontWeight: 600,
                                        fontSize: 16,
                                        minWidth: 120
                                      }}>
                                        {group.subTag.tag}
                                      </span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{
                                          background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                                          color: '#389e0d',
                                          borderRadius: '6px',
                                          padding: '4px 12px',
                                          fontWeight: 600,
                                          fontSize: '13px',
                                          border: '1px solid #b7eb8f',
                                          boxShadow: '0 1px 3px rgba(56, 158, 13, 0.1)'
                                        }}>
                                          💰 ₹{group.subTag.credit_sum || 0}
                                        </span>
                                        <span style={{
                                          background: 'linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)',
                                          color: '#cf1322',
                                          borderRadius: '6px',
                                          padding: '4px 12px',
                                          fontWeight: 600,
                                          fontSize: '13px',
                                          border: '1px solid #ffccc7',
                                          boxShadow: '0 1px 3px rgba(207, 19, 34, 0.1)'
                                        }}>
                                          💸 ₹{Math.abs(group.subTag.debit_sum || 0)}
                                        </span>
                                        <span style={{
                                          background: 'linear-gradient(135deg, #f0f5ff 0%, #d6e4ff 100%)',
                                          color: '#1677ff',
                                          borderRadius: '6px',
                                          padding: '4px 12px',
                                          fontWeight: 700,
                                          fontSize: '14px',
                                          border: '1px solid #adc6ff',
                                          boxShadow: '0 2px 4px rgba(22, 119, 255, 0.15)',
                                          minWidth: 80,
                                          textAlign: 'center'
                                        }}>
                                          📊 ₹{group.subTag.balance || 0}
                                        </span>
                                        <span style={{
                                          background: '#fafafa',
                                          color: '#595959',
                                          borderRadius: '6px',
                                          padding: '4px 10px',
                                          fontSize: '12px',
                                          border: '1px solid #d9d9d9',
                                          fontWeight: 500
                                        }}>
                                          {group.subTag.count} txns
                                        </span>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      {getSubTagChartIconDropdown(group, subTagChartType, handleSubTagChart)}
                                      <PieChartOutlined
                                        style={{
                                          fontSize: 16,
                                          color: subTagChartType === 'pie' ? '#1677ff' : '#8c8c8c',
                                          cursor: 'pointer',
                                          padding: '4px',
                                          borderRadius: 4,
                                          background: subTagChartType === 'pie' ? '#f0f5ff' : 'transparent'
                                        }}
                                        onClick={e => {
                                          e.stopPropagation();
                                          handleSubTagChart(group.subTag.tag, 'pie');
                                        }}
                                        title="Pie Chart"
                                      />
                                    </div>
                                  </div>
                                }
                                style={{
                                  marginBottom: 12,
                                  borderRadius: 8,
                                  border: '1px solid #e8e8e8',
                                  background: '#fafafa'
                                }}
                              >
                                <div style={{ padding: '8px 0' }}>
                                  {group.transactions.length === 0 ? (
                                    <div style={{
                                      color: '#8c8c8c',
                                      fontSize: 15,
                                      textAlign: 'center',
                                      padding: '20px 0',
                                      fontStyle: 'italic'
                                    }}>
                                      No transactions found for this tag.
                                    </div>
                                  ) : (
                                    <>
                                      {group.transactions.map((txRow, tIdx) => (
                                        <Card
                                          key={tIdx}
                                          size="small"
                                          style={{
                                            marginBottom: 8,
                                            borderRadius: 6,
                                            border: '1px solid #f0f0f0',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                            transition: 'all 0.2s ease'
                                          }}
                                          bodyStyle={{
                                            padding: '12px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16
                                          }}
                                          hoverable
                                        >
                                          <span style={{
                                            color: '#8c8c8c',
                                            minWidth: 100,
                                            fontSize: 13,
                                            fontWeight: 500
                                          }}>
                                            {new Date(txRow.date).toLocaleDateString('en-IN', {
                                              day: '2-digit',
                                              month: 'short',
                                              year: 'numeric'
                                            })}
                                          </span>
                                          <span style={{
                                            fontWeight: 600,
                                            flex: 1,
                                            color: '#262626',
                                            fontSize: 14
                                          }}>
                                            {txRow.name}
                                          </span>
                                          <span style={{
                                            color: txRow.amount >= 0 ? '#52c41a' : '#ff4d4f',
                                            fontWeight: 700,
                                            minWidth: 100,
                                            textAlign: 'right',
                                            fontSize: 15,
                                            background: txRow.amount >= 0 ? '#f6ffed' : '#fff2f0',
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            border: `1px solid ${txRow.amount >= 0 ? '#b7eb8f' : '#ffccc7'}`
                                          }}>
                                            {txRow.amount >= 0 ? '+' : ''}₹{txRow.amount}
                                          </span>
                                          <div style={{ minWidth: 120 }}>
                                            {txRow.tags && txRow.tags.map((tag) => (
                                              <Tag
                                                key={tag}
                                                color="geekblue"
                                                style={{
                                                  marginRight: 4,
                                                  marginBottom: 2,
                                                  fontSize: 11,
                                                  borderRadius: 3
                                                }}
                                              >
                                                {tag}
                                              </Tag>
                                            ))}
                                          </div>
                                        </Card>
                                      ))}

                                      {/* Sub-tag chart */}
                                      {subTagChartType === 'bar' && (
                                        <div style={{ marginTop: 20, marginBottom: 12 }}>
                                          <Card
                                            size="small"
                                            title={
                                              <span style={{ color: '#1677ff', fontWeight: 600 }}>
                                                📊 Spending Over Time: {group.subTag.tag}
                                              </span>
                                            }
                                            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                                          >
                                            {(() => {
                                              // Group transactions by selected range for both credit and debit
                                              let monthlyData = {};
                                              group.transactions.forEach(tx => {
                                                const date = new Date(tx.date);
                                                let key;
                                                if (subTagChartType.range === 'daily') {
                                                  key = date.toISOString().slice(0, 10);
                                                } else if (subTagChartType.range === 'weekly') {
                                                  const weekStart = new Date(date);
                                                  weekStart.setDate(date.getDate() - date.getDay());
                                                  key = weekStart.toISOString().slice(0, 10);
                                                } else {
                                                  key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                                }
                                                if (!monthlyData[key]) {
                                                  monthlyData[key] = { key, credit: 0, debit: 0 };
                                                }
                                                const amount = tx.amount ? parseFloat(tx.amount) : 0;
                                                if (amount >= 0) {
                                                  monthlyData[key].credit += amount;
                                                } else {
                                                  monthlyData[key].debit += Math.abs(amount);
                                                }
                                              });
                                              const data = Object.values(monthlyData).sort((a, b) => a.key.localeCompare(b.key));
                                              const chartData = {
                                                labels: data.map(d => d.key),
                                                datasets: [
                                                  {
                                                    label: 'Credit',
                                                    data: data.map(d => d.credit),
                                                    backgroundColor: '#16a34a',
                                                    borderRadius: 6,
                                                    barPercentage: 0.6,
                                                  },
                                                  {
                                                    label: 'Debit',
                                                    data: data.map(d => d.debit),
                                                    backgroundColor: '#d32f2f',
                                                    borderRadius: 6,
                                                    barPercentage: 0.6,
                                                  },
                                                ],
                                              };
                                              const options = {
                                                responsive: true,
                                                plugins: {
                                                  legend: { display: true },
                                                  tooltip: {
                                                    callbacks: {
                                                      label: ctx => `₹${ctx.parsed.y}`,
                                                    },
                                                  },
                                                  title: {
                                                    display: true,
                                                    text: `Spending Over Time (Credit vs Debit)` ,
                                                    color: '#222',
                                                    font: { size: 16, weight: 'bold' },
                                                  },
                                                },
                                                scales: {
                                                  x: { grid: { display: false } },
                                                  y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                                                },
                                              };
                                              return <Bar data={chartData} options={options} height={220} />;
                                            })()}
                                          </Card>
                                        </div>
                                      )}

                                      {subTagChartType === 'pie' && (
                                        <div style={{ marginTop: 20, marginBottom: 12 }}>
                                          <Card
                                            size="small"
                                            title={
                                              <span style={{ color: '#1677ff', fontWeight: 600 }}>
                                                🥧 Tag Distribution: {group.subTag.tag}
                                              </span>
                                            }
                                            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                                          >
                                            <ChartJSPie data={generatePieData(group.transactions)} title={null} />
                                          </Card>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </Collapse.Panel>
                            );
                          })}
                        </Collapse>
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                </div>
              ) : null
            ))}
          </div>
        )}
      </Card>

      {/* Edit Transaction Modal */}
      <TransactionEditModal
        open={isEditModalVisible}
        onCancel={handleEditModalCancel}
        onSubmit={handleEditModalSubmit}
        form={editForm}
        editingTransaction={editingTransaction}
        tags={tags}
        loading={loading}
      />

      {/* Edit Board Modal */}
      <TagInsightsBoardEditModal
        open={isBoardEditModalVisible}
        onCancel={handleBoardEditModalCancel}
        onSubmit={handleBoardEditModalSubmit}
        form={boardEditForm}
        initialData={board}
        tags={tags}
        loading={loading}
      />
    </div>
  );
}

// Chart dropdown for sub tag (for icon in header)
function getSubTagChartIconDropdown(group, subTagChartType, handleSubTagChart) {
  return (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item key="bar-daily" onClick={e => { e.domEvent.stopPropagation(); handleSubTagChart(group.subTag.tag, { type: 'bar', range: 'daily' }); }}>Daily</Menu.Item>
          <Menu.Item key="bar-weekly" onClick={e => { e.domEvent.stopPropagation(); handleSubTagChart(group.subTag.tag, { type: 'bar', range: 'weekly' }); }}>Weekly</Menu.Item>
          <Menu.Item key="bar-monthly" onClick={e => { e.domEvent.stopPropagation(); handleSubTagChart(group.subTag.tag, { type: 'bar', range: 'monthly' }); }}>Monthly</Menu.Item>
        </Menu>
      }
      placement="bottomRight"
      trigger={["click"]}
    >
      <AreaChartOutlined
        style={{
          fontSize: 16,
          color: subTagChartType && subTagChartType.type === 'bar' ? '#1677ff' : '#8c8c8c',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: 4,
          background: subTagChartType && subTagChartType.type === 'bar' ? '#f0f5ff' : 'transparent'
        }}
        title="Bar Chart"
        onClick={e => e.stopPropagation()}
      />
    </Dropdown>
  );
}
