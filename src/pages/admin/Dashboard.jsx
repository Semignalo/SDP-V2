import React from 'react';
import { TrendingUp, ShoppingCart, Users, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Pendapatan"
                    value="Rp 38.105.350"
                    subtext="Total Lifetime"
                    trend="up"
                    icon={TrendingUp}
                    color="bg-green-500"
                />
                <StatCard
                    title="Pesanan Aktif"
                    value="7"
                    subtext="Perlu Diproses"
                    trend="neutral"
                    icon={ShoppingCart}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Customer"
                    value="9"
                    subtext="Terdaftar"
                    trend="up"
                    icon={Users}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Stok Menipis"
                    value="0"
                    subtext="Item Perlu Restock"
                    trend="down"
                    icon={AlertCircle}
                    color="bg-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Chart Placeholder */}
                <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2 min-h-[300px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Penjualan 7 Hari Terakhir</h3>
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
                        Chart Visualization Placeholder
                    </div>
                </div>

                {/* Stok Menipis Placeholder */}
                <div className="bg-white p-6 rounded-xl shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-4">
                        <AlertCircle size={20} /> Stok Menipis
                    </h3>
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        Stok aman.
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Pesanan Terbaru</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Total</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { id: '#pc0esTKb', customer: 'Stefanus Lo', total: 'Rp 1.302.500', status: 'Pending Payment', date: '13/1/2026', statusColor: 'bg-yellow-100 text-yellow-700' },
                                { id: '#FyD61JaM', customer: 'Stefanus Lo', total: 'Rp 1.673.375', status: 'Completed', date: '13/1/2026', statusColor: 'bg-green-100 text-green-700' },
                                { id: '#2hSsicaN', customer: 'Stefanus Lo', total: 'Rp 1.722.500', status: 'Completed', date: '10/1/2026', statusColor: 'bg-green-100 text-green-700' },
                                { id: '#mb1zAkrE', customer: 'Stefanus Lo', total: 'Rp 1.239.875', status: 'Pending Payment', date: '10/1/2026', statusColor: 'bg-yellow-100 text-yellow-700' },
                            ].map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-blue-600">{order.id}</td>
                                    <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{order.total}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

function StatCard({ title, value, subtext, trend, icon: Icon, color }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400'}`}>
                    {trend === 'up' && '↑'} {subtext}
                </p>
            </div>
            <div className={`p-3 rounded-lg text-white ${color} shadow-lg shadow-${color.replace('bg-', '')}/30`}>
                <Icon size={20} />
            </div>
        </div>
    )
}
