import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

interface OrderMetrics {
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
}

const Dashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const [metrics, setMetrics] = useState<OrderMetrics>({
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  });

  useEffect(() => {
    console.log('Dashboard component mounted');
    if (user?.role === 'admin' && pb.authStore.isValid) {
      fetchOrderMetrics();
    } else if (!user) {
      console.log('User is not authenticated, skipping metrics fetch');
    } else if (user.role !== 'admin') {
      console.log('User is not an admin, skipping metrics fetch');
    }
  }, [user]);

  useEffect(() => {
    console.log('Current user in Dashboard:', user);
  }, [user]);

  const fetchOrderMetrics = async () => {
    if (!pb.authStore.isValid) {
      console.log('User is not authenticated, cannot fetch metrics');
      return;
    }
    if (user?.role !== 'admin') {
      console.log('User is not an admin, cannot fetch metrics');
      return;
    }

    try {
      const totalOrdersResult = await pb.collection('orders').getList(1, 1, {
        filter: 'created > "2023-01-01 00:00:00"',
        $cancelKey: 'total-orders',
      });
      const pendingOrdersResult = await pb.collection('orders').getList(1, 1, {
        filter: 'status = "Pending"',
        $cancelKey: 'pending-orders',
      });
      
      // Calculate total revenue (this is a placeholder calculation)
      const revenue = totalOrdersResult.items.reduce((sum, order) => sum + (parseFloat(order.order_quantity) || 0), 0);

      setMetrics({
        totalOrders: totalOrdersResult.totalItems,
        pendingOrders: pendingOrdersResult.totalItems,
        revenue: revenue,
      });
    } catch (error) {
      console.error('Error fetching order metrics:', error);
      if (error.status === 403) {
        console.log('Permission denied: User does not have access to fetch metrics');
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Orders (This Year)
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {metrics.totalOrders}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              View all
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Revenue (Placeholder)
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  ${metrics.revenue.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-green-600 hover:text-green-500">
              View report
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Orders
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {metrics.pendingOrders}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-yellow-600 hover:text-yellow-500">
              Process orders
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMemberDashboard = () => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <h2 className="text-lg font-semibold text-gray-900">Welcome, {user?.email}</h2>
        <p className="mt-2 text-sm text-gray-600">You are logged in as a member. You can view and update orders.</p>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <Link to="/orders" className="font-medium text-indigo-600 hover:text-indigo-500">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg" alt="Workflow" />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Orders
                </a>
                {user?.role === 'admin' && (
                  <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Inventory
                  </a>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              {user?.role === 'admin' && (
                <Link
                  to="/add-order"
                  className="bg-green-600 p-2 rounded-md text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Order
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-indigo-600 p-2 rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Order Management Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {user?.role === 'admin' ? renderAdminDashboard() : renderMemberDashboard()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
