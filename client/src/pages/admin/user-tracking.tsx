import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { 
  MapPin, Monitor, Smartphone, Globe, Clock, 
  Users, Shield, Ban, Eye, Activity, DollarSign,
  Calendar, UserCheck, UserX, AlertTriangle 
} from 'lucide-react';
import AdminLayout from '@/components/admin/admin-layout';

interface UserTrackingData {
  id: number;
  username: string;
  email?: string;
  isAdmin: boolean;
  isBanned: boolean;
  isPremium: boolean;
  createdAt: string;
  lastLogin?: string;
  loginCount: number;
  totalSpent: number;
  lastIpAddress?: string;
  registrationIpAddress?: string;
  country?: string;
  city?: string;
  region?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  timezone?: string;
  referrer?: string;
  discordId?: string;
  discordUsername?: string;
}

export default function UserTracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'premium' | 'banned' | 'suspicious'>('all');

  const { data: users, isLoading } = useQuery<UserTrackingData[]>({
    queryKey: ['/api/admin/users/tracking'],
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastIpAddress?.includes(searchTerm) ||
      user.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'admin' && user.isAdmin) ||
      (filterType === 'premium' && user.isPremium) ||
      (filterType === 'banned' && user.isBanned) ||
      (filterType === 'suspicious' && (
        user.loginCount > 100 || 
        !user.lastIpAddress ||
        user.totalSpent > 500
      ));

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: users?.length || 0,
    active: users?.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0,
    premium: users?.filter(u => u.isPremium).length || 0,
    banned: users?.filter(u => u.isBanned).length || 0,
    totalRevenue: users?.reduce((sum, u) => sum + u.totalSpent, 0) || 0,
    uniqueCountries: new Set(users?.map(u => u.country).filter(Boolean)).size || 0
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-slate-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-700 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const DeviceIcon = ({ deviceType }: { deviceType?: string }) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Monitor className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">User Tracking & Analytics</h1>
          <p className="text-slate-400">Comprehensive user monitoring and behavioral analytics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-900/50 to-green-800/30 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Active (30d)</p>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Premium</p>
                  <p className="text-2xl font-bold text-white">{stats.premium}</p>
                </div>
                <UserCheck className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-900/50 to-red-800/30 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm font-medium">Banned</p>
                  <p className="text-2xl font-bold text-white">{stats.banned}</p>
                </div>
                <UserX className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/30 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Revenue</p>
                  <p className="text-2xl font-bold text-white">${stats.totalRevenue}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-900/50 to-indigo-800/30 border-indigo-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-300 text-sm font-medium">Countries</p>
                  <p className="text-2xl font-bold text-white">{stats.uniqueCountries}</p>
                </div>
                <Globe className="h-8 w-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/80 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by username, email, IP address, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'admin', 'premium', 'banned', 'suspicious'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={filterType === filter ? "default" : "outline"}
                    onClick={() => setFilterType(filter)}
                    className={filterType === filter ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User List */}
        <div className="grid gap-4">
          {filteredUsers?.map((user) => (
            <Card key={user.id} className="bg-slate-900/80 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* User Basic Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">{user.username}</h3>
                      <div className="flex gap-2">
                        {user.isAdmin && <Badge className="bg-red-600 hover:bg-red-700">Admin</Badge>}
                        {user.isPremium && <Badge className="bg-purple-600 hover:bg-purple-700">Premium</Badge>}
                        {user.isBanned && <Badge className="bg-gray-600 hover:bg-gray-700">Banned</Badge>}
                      </div>
                    </div>
                    
                    {user.email && (
                      <p className="text-slate-300 mb-2">{user.email}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {user.lastLogin && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-slate-400">
                        <Activity className="h-4 w-4" />
                        <span>Login Count: {user.loginCount}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400">
                        <DollarSign className="h-4 w-4" />
                        <span>Total Spent: ${user.totalSpent}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Device Info */}
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-white mb-3">Location & Device</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {user.lastIpAddress && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Globe className="h-4 w-4" />
                          <span>IP: {user.lastIpAddress}</span>
                        </div>
                      )}

                      {user.country && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="h-4 w-4" />
                          <span>{user.city}, {user.country}</span>
                        </div>
                      )}

                      {user.deviceType && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <DeviceIcon deviceType={user.deviceType} />
                          <span>{user.deviceType.charAt(0).toUpperCase() + user.deviceType.slice(1)}</span>
                        </div>
                      )}

                      {user.browser && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Monitor className="h-4 w-4" />
                          <span>{user.browser} on {user.operatingSystem}</span>
                        </div>
                      )}

                      {user.timezone && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>Timezone: {user.timezone}</span>
                        </div>
                      )}

                      {user.referrer && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Eye className="h-4 w-4" />
                          <span>Referrer: {user.referrer}</span>
                        </div>
                      )}
                    </div>

                    {user.discordUsername && (
                      <div className="mt-3 p-3 bg-indigo-900/30 rounded-lg border border-indigo-500/20">
                        <div className="flex items-center gap-2 text-indigo-300">
                          <Shield className="h-4 w-4" />
                          <span>Discord: {user.discordUsername}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    {!user.isBanned ? (
                      <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/50">
                        <Ban className="h-4 w-4 mr-1" />
                        Ban User
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="border-green-600 text-green-400 hover:bg-green-900/50">
                        <UserCheck className="h-4 w-4 mr-1" />
                        Unban
                      </Button>
                    )}

                    {user.loginCount > 50 && !user.lastIpAddress && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">Suspicious</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers?.length === 0 && (
          <Card className="bg-slate-900/80 border-slate-700">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Users Found</h3>
              <p className="text-slate-400">Try adjusting your search terms or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}