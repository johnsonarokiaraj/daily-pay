import React, { useEffect, useState } from 'react';
import BoardDetails from './BoardDetails';

export default function BoardDetailsPage({ boardId }) {
  const [mainTag, setMainTag] = useState(null);
  const [subTags, setSubTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBoard() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tag_insights_boards/${boardId}.json`);
        if (!res.ok) throw new Error('Failed to fetch board');
        const data = await res.json();
        // data.flattened is expected from your API
        // Use optional chaining only if supported, otherwise fallback
        const main = data.flattened && data.flattened.find(row => row.type === 'main_tag');
        const subs = data.flattened && data.flattened.filter(row => row.type === 'sub_tag');
        setMainTag(main);
        setSubTags(subs);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBoard();
  }, [boardId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>Error: {error}</div>;
  return <BoardDetails mainTag={mainTag} subTags={subTags} />;
}
