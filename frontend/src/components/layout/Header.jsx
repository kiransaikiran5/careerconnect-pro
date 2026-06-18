import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  const role = String(user?.role || '').toUpperCase();

  const isLoggedIn = Boolean(user);
  const isJobSeeker = role === 'JOB_SEEKER';
  const isRecruiter = role === 'RECRUITER';
  const isAdmin = role === 'ADMIN';

  const canUseMessages = ['JOB_SEEKER', 'RECRUITER', 'ADMIN'].includes(role);

  const userEmail = user?.email || '';
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';
  const roleLabel = formatRole(role);
  const totalUnread = Number(notificationCount || 0) + Number(messageCount || 0);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const closeMenus = useCallback(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen((prev) => !prev);
    setMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
    setUserMenuOpen(false);
  }, []);

  const fetchHeaderCounts = useCallback(async () => {
    if (!isLoggedIn) {
      setNotificationCount(0);
      setMessageCount(0);
      return;
    }

    let notifications = 0;
    let messages = 0;

    try {
      const res = await api.get('/notifications/unread-count');
      notifications = Number(res.data?.unread_count || 0);
    } catch {
      try {
        const res = await api.get('/notifications/');
        const list = Array.isArray(res.data) ? res.data : [];
        notifications = list.filter((item) => !item.is_read).length;
      } catch {
        notifications = 0;
      }
    }

    if (canUseMessages) {
      try {
        const res = await api.get('/messages/unread-count');
        messages = Number(res.data?.unread_count || 0);
      } catch {
        try {
          const res = await api.get('/messages/conversations');
          const list = Array.isArray(res.data) ? res.data : [];
          messages = list.reduce(
            (total, item) => total + Number(item.unread_count || 0),
            0
          );
        } catch {
          messages = 0;
        }
      }
    }

    setNotificationCount(notifications);
    setMessageCount(messages);
  }, [isLoggedIn, canUseMessages]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') closeMenus();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeMenus]);

  useEffect(() => {
    closeMenus();
    fetchHeaderCounts();
  }, [location.pathname, closeMenus, fetchHeaderCounts]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    fetchHeaderCounts();

    const handleRefreshCounts = () => {
      fetchHeaderCounts();
    };

    window.addEventListener('careerconnect:refresh-counts', handleRefreshCounts);
    window.addEventListener('focus', handleRefreshCounts);

    const intervalId = window.setInterval(() => {
      fetchHeaderCounts();
    }, 15000);

    return () => {
      window.removeEventListener('careerconnect:refresh-counts', handleRefreshCounts);
      window.removeEventListener('focus', handleRefreshCounts);
      window.clearInterval(intervalId);
    };
  }, [isLoggedIn, fetchHeaderCounts]);

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      setNotificationCount(0);
      setMessageCount(0);
      closeMenus();

      toast.success('Logged out successfully.');
      navigate('/login', { replace: true });
    } catch {
      toast.error('Logout failed. Please try again.');
    }
  };

  // Main navigation links
  const mainLinks = [
    { path: '/', label: 'Home' },
    { path: '/jobs', label: 'Find Jobs' },
    { path: '/companies', label: 'Companies' },

    ...(isJobSeeker
      ? [{ path: '/application-dashboard', label: 'Applications' }]
      : []),

    ...(isLoggedIn && !isRecruiter && !isAdmin
      ? [{ path: '/dashboard', label: 'Dashboard' }]
      : []),

    ...(isRecruiter
      ? [
          { path: '/hiring-dashboard', label: 'Dashboard' },
          { path: '/manage-jobs', label: 'Manage Jobs', highlight: true },
          { path: '/analytics', label: 'Analytics' },
        ]
      : []),

    ...(isAdmin
      ? [
          { path: '/admin-dashboard', label: 'Dashboard' },
          { path: '/analytics', label: 'Analytics' },
          { path: '/admin/categories', label: 'Categories' },
          { path: '/admin/recruiters', label: 'Recruiters', highlight: true },

        ]
      : []),
  ];

  const accountLinks = [
    { path: '/profile', label: 'Profile', icon: UserIcon },
    {
      path: '/notifications',
      label: 'Notifications',
      icon: BellIcon,
      badge: notificationCount,
    },
    ...(canUseMessages
      ? [
          {
            path: '/messages',
            label: 'Messages',
            icon: MessageIcon,
            badge: messageCount,
          },
        ]
      : []),
    { path: '/ai-assistant', label: 'AI Assistant', icon: BotIcon },
    { path: '/resumes', label: 'Resumes', icon: ResumeIcon },
    { path: '/saved-jobs', label: 'Saved Jobs', icon: BookmarkIcon },
    ...(isJobSeeker
      ? [
          { path: '/applications', label: 'My Applications', icon: ClipboardIcon },
          { path: '/my-interviews', label: 'My Interviews', icon: CalendarIcon },
          { path: '/recommendations', label: 'Recommendations', icon: SparkIcon },
        ]
      : []),
  ];

  const careerLinks = [
    { path: '/skills', label: 'Skills', icon: SparkIcon },
    { path: '/education', label: 'Education', icon: EducationIcon },
    { path: '/experience', label: 'Experience', icon: BriefcaseIcon },
  ];

  const recruiterLinks = [
    { path: '/recruiter-profile', label: 'Recruiter Profile', icon: RecruiterIcon },
    { path: '/hiring-dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/manage-jobs', label: 'Manage Jobs', icon: BriefcaseIcon },
    { path: '/subscription-plans', label: 'Plans', icon: PlanIcon },
    { path: '/payment-history', label: 'Payments', icon: PaymentIcon },
    { path: '/online-interviews', label: 'Online Interviews', icon: VideoIcon },
    { path: '/interviews', label: 'Interviews', icon: CalendarIcon },
    { path: '/analytics', label: 'Analytics & Reports', icon: AnalyticsIcon },
  ];

  const adminLinks = [
    { path: '/manage-jobs', label: 'Manage Jobs', icon: BriefcaseIcon },
    { path: '/interviews', label: 'Interviews', icon: CalendarIcon },
    { path: '/online-interviews', label: 'Online Interviews', icon: VideoIcon },
    { path: '/admin/recruiters', label: 'Manage Recruiters', icon: UsersIcon },
    { path: '/admin/categories', label: 'Job Categories', icon: CategoryIcon },
    { path: '/analytics', label: 'Analytics & Reports', icon: AnalyticsIcon },
    { path: '/admin/plans', label: 'Plans', icon: PlanIcon },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: DashboardIcon },
    { path: '/admin/moderation', label: 'Moderation', icon: DashboardIcon },
    { path: '/admin/business-intelligence', label: 'Business Intelligence', icon: AnalyticsIcon },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenus}
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 transition group-hover:-translate-y-0.5">
              <BriefcaseIcon className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
                CareerConnect
                <span className="hidden sm:inline"> Pro</span>
              </h1>
              <p className="hidden text-xs font-semibold text-slate-500 lg:block">
                Recruitment Platform
              </p>
            </div>
          </Link>

          {/* Main navigation */}
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {mainLinks.map((link) => (
              <NavItem
                key={link.path}
                to={link.path}
                active={isActive(link.path)}
                highlight={link.highlight}
              >
                {link.label}
              </NavItem>
            ))}
          </nav>

          {/* Right side: icons + user menu */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {isLoggedIn ? (
              <>
                {canUseMessages && (
                  <HeaderIconLink
                    to="/messages"
                    active={isActive('/messages')}
                    title="Messages"
                    count={messageCount}
                    onClick={closeMenus}
                    icon={MessageIcon}
                  />
                )}
                <HeaderIconLink
                  to="/notifications"
                  active={isActive('/notifications')}
                  title="Notifications"
                  count={notificationCount}
                  onClick={closeMenus}
                  icon={BellIcon}
                />

                <div ref={userMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={toggleUserMenu}
                    className={`flex items-center gap-2 rounded-3xl border px-2.5 py-2 transition ${
                      userMenuOpen
                        ? 'border-indigo-200 bg-indigo-50 shadow-lg shadow-indigo-100'
                        : 'border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50'
                    }`}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                  >
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-sm font-black text-white shadow-sm">
                      {userInitial}
                      {totalUnread > 0 && (
                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-600 ring-2 ring-white" />
                      )}
                    </div>
                    <div className="hidden max-w-44 text-left lg:block">
                      <p className="truncate text-sm font-black text-slate-900">
                        {userEmail}
                      </p>
                      <p className="text-xs font-semibold text-slate-500">
                        {roleLabel}
                      </p>
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-slate-400 transition ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/70"
                      role="menu"
                    >
                      <div className="max-h-[calc(100vh-13rem)] overflow-y-auto p-2">
                        <MenuSection title="Account">
                          {accountLinks.map((item) => (
                            <DropdownLink
                              key={item.path}
                              item={item}
                              active={isActive(item.path)}
                              onClick={closeMenus}
                            />
                          ))}
                        </MenuSection>

                        <MenuSection title="Career Details">
                          {careerLinks.map((item) => (
                            <DropdownLink
                              key={item.path}
                              item={item}
                              active={isActive(item.path)}
                              onClick={closeMenus}
                              compact
                            />
                          ))}
                        </MenuSection>

                        {isRecruiter && (
                          <MenuSection title="Recruiter Tools">
                            {recruiterLinks.map((item) => (
                              <DropdownLink
                                key={item.path}
                                item={item}
                                active={isActive(item.path)}
                                onClick={closeMenus}
                              />
                            ))}
                          </MenuSection>
                        )}

                        {isAdmin && (
                          <MenuSection title="Admin Tools">
                            {adminLinks.map((item) => (
                              <DropdownLink
                                key={item.path}
                                item={item}
                                active={isActive(item.path)}
                                onClick={closeMenus}
                              />
                            ))}
                          </MenuSection>
                        )}
                      </div>

                      <div className="border-t border-slate-100 bg-slate-50 p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 py-3 text-sm font-black text-red-600 transition hover:bg-red-100"
                        >
                          <LogoutIcon className="h-5 w-5" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-2xl px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <CloseIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
            {isLoggedIn && totalUnread > 0 && (
              <Badge count={totalUnread} small />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="max-h-[calc(100vh-80px)] overflow-y-auto border-t border-slate-200 py-4 md:hidden">
            <div className="space-y-1">
              {mainLinks.map((link) => (
                <MobileNavItem
                  key={link.path}
                  to={link.path}
                  active={isActive(link.path)}
                  onClick={closeMenus}
                >
                  {link.label}
                </MobileNavItem>
              ))}

              {isLoggedIn && (
                <>
                  <MobileGroupTitle>Account</MobileGroupTitle>
                  {[...accountLinks, ...careerLinks].map((link) => (
                    <MobileNavItem
                      key={link.path}
                      to={link.path}
                      active={isActive(link.path)}
                      badge={link.badge}
                      onClick={closeMenus}
                    >
                      {link.label}
                    </MobileNavItem>
                  ))}

                  {isRecruiter && (
                    <>
                      <MobileGroupTitle>Recruiter Tools</MobileGroupTitle>
                      {recruiterLinks.map((link) => (
                        <MobileNavItem
                          key={link.path}
                          to={link.path}
                          active={isActive(link.path)}
                          onClick={closeMenus}
                        >
                          {link.label}
                        </MobileNavItem>
                      ))}
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <MobileGroupTitle>Admin Tools</MobileGroupTitle>
                      {adminLinks.map((link) => (
                        <MobileNavItem
                          key={link.path}
                          to={link.path}
                          active={isActive(link.path)}
                          onClick={closeMenus}
                        >
                          {link.label}
                        </MobileNavItem>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              {isLoggedIn ? (
                <>
                  <div className="mb-3 rounded-3xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-sm font-black text-white">
                        {userInitial}
                        {totalUnread > 0 && (
                          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-600 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {userEmail}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          {roleLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100"
                  >
                    <LogoutIcon className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid gap-2">
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenus}
                    className="rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-4 py-3 text-center text-sm font-black text-white shadow-lg shadow-indigo-500/25"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ================= SUB-COMPONENTS ================= */

function HeaderIconLink({ to, active, title, count, onClick, icon: Icon }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
        active
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
      }`}
    >
      <Icon className="h-5 w-5" />
      {Number(count) > 0 && <Badge count={count} />}
    </Link>
  );
}

function Badge({ count, small = false }) {
  return (
    <span
      className={`absolute flex items-center justify-center rounded-full bg-red-600 font-black text-white ring-2 ring-white ${
        small
          ? '-right-1 -top-1 min-h-5 min-w-5 px-1 text-[10px]'
          : '-right-1.5 -top-1.5 min-h-5 min-w-5 px-1.5 text-[10px]'
      }`}
    >
      {Number(count) > 99 ? '99+' : count}
    </span>
  );
}

function NavItem({ to, active, highlight, children }) {
  return (
    <Link
      to={to}
      className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
        active
          ? 'bg-indigo-50 text-indigo-700'
          : highlight
            ? 'bg-slate-50 text-indigo-700 hover:bg-indigo-50'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavItem({ to, active, onClick, children, badge = 0 }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
        active
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <span>{children}</span>
      {Number(badge) > 0 && (
        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
          {Number(badge) > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

function DropdownLink({ item, active, onClick, compact = false }) {
  const Icon = item.icon;
  const badge = Number(item.badge || 0);
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl text-sm font-black transition ${
        compact ? 'px-3 py-2' : 'px-3 py-2.5'
      } ${
        active
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {badge > 0 && (
        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

function MenuSection({ title, children }) {
  return (
    <div className="mb-2">
      <p className="px-3 pb-1 pt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MobileGroupTitle({ children }) {
  return (
    <p className="px-4 pb-1 pt-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
      {children}
    </p>
  );
}

function formatRole(role) {
  if (!role) return 'User';
  return String(role)
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/* ================= ICONS ================= */

function BriefcaseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h14" />
    </svg>
  );
}

function BellIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17H9m9-1V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2ZM10 20h4" />
    </svg>
  );
}

function MessageIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h7M5 20l3.5-3H18a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h.5L5 20Z" />
    </svg>
  );
}

function BotIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3M8 6h8a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01M9.5 16h5" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function ResumeIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M8 13h8M8 17h5" />
    </svg>
  );
}

function ClipboardIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6M9 5a3 3 0 0 1 6 0M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 12h6M9 16h4" />
    </svg>
  );
}

function BookmarkIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v17l-6-4-6 4V4Z" />
    </svg>
  );
}

function CalendarIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v3M17 3v3M4 8h16M5 5h14v16H5V5Z" />
    </svg>
  );
}

function VideoIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5A2.5 2.5 0 0 1 6.5 5h7A2.5 2.5 0 0 1 16 7.5v9A2.5 2.5 0 0 1 13.5 19h-7A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m16 10 4-2.5v9L16 14v-4Z" />
    </svg>
  );
}

function RecruiterIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m10 14 2 2 2-2" />
    </svg>
  );
}

function DashboardIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h6V4H4v9ZM14 20h6V4h-6v16ZM4 20h6v-4H4v4Z" />
    </svg>
  );
}

function CategoryIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 0 1 6.5 4H9l2 2h6.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-10Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h8M8 15h5" />
    </svg>
  );
}

function EducationIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 8 9-4 9 4-9 4-9-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.5V15c0 1.7 2.2 3 5 3s5-1.3 5-3v-4.5" />
    </svg>
  );
}

function SparkIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19a6 6 0 0 0-12 0M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM21 19a4.5 4.5 0 0 0-6-4.2M16 3.3a4 4 0 0 1 0 7.4" />
    </svg>
  );
}

function AnalyticsIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8M20 16v-3" />
    </svg>
  );
}
function PlanIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M6 7v12h12V7M9 11h6M9 15h4M8 4h8l1 3H7l1-3Z" />
    </svg>
  );
}

function PaymentIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm2 10h4" />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 15l3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}

function ChevronDownIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MenuIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}