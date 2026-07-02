'use client'

import { useState, useEffect } from 'react'
import { Employee, Role } from '@/types/employee'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active'
  })
  const [isAdding, setIsAdding] = useState(false)

  // 직원 목록 가져오기
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees')
        if (!res.ok) throw new Error('직원 정보를 불러오지 못했습니다')
        const data = await res.json()
        setEmployees(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/roles')
        if (!res.ok) throw new Error('역할 정보를 불러오지 못했습니다')
        const data = await res.json()
        setRoles(data)
      } catch (err: any) {
        setError(err.message)
      }
    }

    fetchEmployees()
    fetchRoles()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error('직원 추가에 실패했습니다')
      
      const newEmployee = await res.json()
      setEmployees(prev => [...prev, newEmployee])
      setFormData({ name: '', email: '', role: '', status: 'active' })
      setIsAdding(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div className="p-4">로딩 중...</div>
  
  if (error) return <div className="p-4 text-red-500">오류: {error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">직원 관리</h1>
      
      {/* 직원 추가 폼 */}
      {isAdding ? (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">이름</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">이메일</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">역할</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full border rounded-md p-2"
                required
              >
                <option value="">역할 선택</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">상태</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full border rounded-md p-2"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
          </div>
          <div className="mt-4 space-x-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              추가
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mb-4 bg-green-500 text-white px-4 py-2 rounded-md"
        >
          직원 추가
        </button>
      )}
      
      {/* 직원 목록 */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">이름</th>
              <th className="py-2 px-4 text-left">이메일</th>
              <th className="py-2 px-4 text-left">역할</th>
              <th className="py-2 px-4 text-left">상태</th>
              <th className="py-2 px-4 text-left">작업</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id} className="border-b">
                <td className="py-2 px-4">{employee.name}</td>
                <td className="py-2 px-4">{employee.email}</td>
                <td className="py-2 px-4">{roles.find(r => r.id === employee.role_id)?.name || '알 수 없음'}</td>
                <td className="py-2 px-4">{employee.status}</td>
                <td className="py-2 px-4">
                  <button className="text-blue-500 hover:underline mr-2">수정</button>
                  <button className="text-red-500 hover:underline">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}