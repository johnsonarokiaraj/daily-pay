import React from 'react';
import ReactDOM from 'react-dom';
import TagInsightsBoards from '../components/TagInsightsBoards';
import { BrowserRouter as Router, Route } from 'react-router-dom';


document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('tag-insights-boards-root');
  if (root) {
    ReactDOM.render(
      <Router>
        <Route path="/tag_insights_boards" component={TagInsightsBoards} />
      </Router>,
      root
    );
  }
});
