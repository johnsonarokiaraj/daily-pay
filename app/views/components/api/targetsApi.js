import axios from 'axios';

export async function fetchTargets() {
  const { data } = await axios.get('/api/targets');
  return data;
}

export async function createTarget(target) {
  const { data } = await axios.post('/api/targets', { target });
  return data;
}

export async function updateTarget(id, target) {
  const { data } = await axios.put(`/api/targets/${id}`, { target });
  return data;
}

export async function deleteTarget(id) {
  await axios.delete(`/api/targets/${id}`);
}

export async function fetchViews() {
  const { data } = await axios.get('/api/views');
  return data;
}

export async function fetchTargetProgress(id) {
  const { data } = await axios.get(`/api/targets/${id}/progress`);
  return data;
}
