import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TagInsightsBoards = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await axios.get('/api/tag_insights_boards');
        setBoards(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load boards. Please try again later.');
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const number_with_delimiter = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="tag-insights-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">
              <i className="fas fa-chart-bar"></i>
              Tag Insights Boards
            </h1>
            <p className="page-subtitle">Analyze and visualize your financial data with custom tag-based boards</p>
          </div>
          <div className="header-actions">
            <Link to="/tag_insights_boards/new" className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Create New Board
            </Link>
          </div>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="boards-grid">
        {boards.map((boardData) => {
          const board = boardData.board;
          const balanceClass = boardData.balance >= 0 ? 'positive' : 'negative';
          const balanceIcon = boardData.balance >= 0 ? 'fa-plus' : 'fa-minus';

          return (
            <div className="board-card" key={board.id}>
              <div className="card-header">
                <div className="board-info">
                  <h3 className="board-title">
                    <Link to={`/tag_insights_boards/${board.id}`} className="board-link">
                      {board.name}
                    </Link>
                  </h3>
                  <div className="board-meta">
                    <span className="main-tag">
                      <i className="fas fa-tag"></i>
                      {board.main_tag}
                    </span>
                    {Array.isArray(board.sub_tags) && board.sub_tags.length > 0 && (
                      <span className="sub-tags-count">
                        <i className="fas fa-tags"></i>
                        {board.sub_tags.length} sub-tags
                      </span>
                    )}
                  </div>
                </div>
                <div className="card-actions">
                  <div className="dropdown">
                    <button className="btn-icon dropdown-toggle" data-toggle="dropdown">
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                    <div className="dropdown-menu">
                      <Link to={`/tag_insights_boards/${board.id}`} className="dropdown-item">
                        <i className="fas fa-eye"></i> View Details
                      </Link>
                      <Link to={`/tag_insights_boards/${board.id}/edit`} className="dropdown-item">
                        <i className="fas fa-edit"></i> Edit Board
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="financial-summary">
                <div className="summary-item credit">
                  <div className="summary-icon"><i className="fas fa-arrow-up"></i></div>
                  <div className="summary-details">
                    <span className="summary-label">Total Credit</span>
                    <span className="summary-amount">₹{number_with_delimiter(boardData.credit_sum)}</span>
                  </div>
                </div>
                <div className="summary-item debit">
                  <div className="summary-icon"><i className="fas fa-arrow-down"></i></div>
                  <div className="summary-details">
                    <span className="summary-label">Total Debit</span>
                    <span className="summary-amount">₹{number_with_delimiter(boardData.debit_sum)}</span>
                  </div>
                </div>
                <div className={`summary-item balance ${balanceClass}`}>
                  <div className="summary-icon"><i className={`fas ${balanceIcon}`}></i></div>
                  <div className="summary-details">
                    <span className="summary-label">Net Balance</span>
                    <span className="summary-amount">₹{number_with_delimiter(boardData.balance)}</span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="board-stats">
                  <span className="stat-item">
                    <i className="fas fa-calendar"></i>
                    Created {new Date(board.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="quick-actions">
                  <Link to={`/tag_insights_boards/${board.id}`} className="btn btn-outline btn-sm">
                    <i className="fas fa-chart-line"></i>
                    Analyze
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {boards.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-chart-bar"></i></div>
            <h3 className="empty-title">No boards created yet</h3>
            <p className="empty-description">Create your first tag insights board to start analyzing your financial data</p>
            <Link to="/tag_insights_boards/new" className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Create Your First Board
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagInsightsBoards;
