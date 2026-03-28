import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminTeamApi } from '../services/adminTeamApi';

const EMPTY_FORM = {
  name: '',
  description: '',
  status: 'AVAILABLE',
};

export function useRescueTeamManagement() {
  const [teams, setTeams] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminTeamApi.getAllTeams();
      setTeams(data);
      setError('');
    } catch {
      setError('Không thể tải danh sách đội cứu hộ');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      const data = await adminTeamApi.getAvailableRescueMembers();
      setAvailableUsers(data);
    } catch {
      // Keep UI usable even when user list fails.
    }
  }, []);

  useEffect(() => {
    fetchTeams();
    fetchAvailableUsers();
  }, [fetchAvailableUsers, fetchTeams]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
    setEditingTeam(null);
  }, []);

  const openCreateModal = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  const closeDetailModal = useCallback(() => {
    setSelectedTeam(null);
  }, []);

  const handleSubmit = useCallback(async (submitData) => {
    try {
      const teamData = {
        name: submitData.name,
        description: submitData.description,
        status: submitData.status || 'AVAILABLE',
        leaderId: submitData.leaderId,
        memberIds: submitData.memberIds,
      };

      if (editingTeam) {
        await adminTeamApi.updateTeam(editingTeam.id, teamData);
      } else {
        await adminTeamApi.createTeam(teamData);
      }

      setShowModal(false);
      resetForm();
      await fetchTeams();
      await fetchAvailableUsers();
    } catch {
      setError(editingTeam ? 'Không thể cập nhật đội' : 'Không thể tạo đội');
    }
  }, [editingTeam, fetchAvailableUsers, fetchTeams, resetForm]);

  const handleEdit = useCallback((team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      status: team.status || 'AVAILABLE',
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (teamId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đội này? Thành viên sẽ không bị xóa, chỉ rời khỏi đội.')) {
      return;
    }

    try {
      await adminTeamApi.deleteTeam(teamId);
      await fetchTeams();
      await fetchAvailableUsers();
    } catch {
      setError('Không thể xóa đội');
    }
  }, [fetchAvailableUsers, fetchTeams]);

  const handleViewDetails = useCallback(async (team) => {
    try {
      const detailData = await adminTeamApi.getTeamById(team.id);
      setSelectedTeam(detailData);
    } catch {
      setError('Không thể tải chi tiết đội');
    }
  }, []);

  const handleRemoveMember = useCallback(async (teamId, userId) => {
    try {
      await adminTeamApi.removeMember(teamId, userId);
      const detailData = await adminTeamApi.getTeamById(teamId);
      setSelectedTeam(detailData);
      await fetchTeams();
      await fetchAvailableUsers();
    } catch {
      setError('Không thể loại bỏ thành viên');
    }
  }, [fetchAvailableUsers, fetchTeams]);

  const filteredTeams = useMemo(() => {
    const normalized = searchTerm.toLowerCase();
    if (!normalized) {
      return teams;
    }

    return teams.filter((team) => team.name.toLowerCase().includes(normalized)
      || team.leaderName?.toLowerCase().includes(normalized));
  }, [searchTerm, teams]);

  const stats = useMemo(() => ({
    total: teams.length,
    available: teams.filter((t) => t.status === 'AVAILABLE').length,
    inMission: teams.filter((t) => t.status === 'IN_MISSION').length,
    totalMembers: teams.reduce((sum, t) => sum + (t.memberCount || t.members?.length || 0), 0),
  }), [teams]);

  return {
    teams,
    availableUsers,
    loading,
    error,
    showModal,
    editingTeam,
    selectedTeam,
    searchTerm,
    formData,
    filteredTeams,
    stats,
    setSearchTerm,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleViewDetails,
    handleRemoveMember,
    openCreateModal,
    closeModal,
    closeDetailModal,
  };
}
