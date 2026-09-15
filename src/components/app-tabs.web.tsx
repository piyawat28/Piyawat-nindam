import React, { useEffect, useState } from 'react';
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
} from 'expo-router/ui';
import { usePathname } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

export default function AppTabs() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const [role, setRole] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('role') || '');
    }
  }, [pathname]);

  const isAdmin = role === 'admin';

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register';

  const isMobile = width < 600;

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');

      window.location.href = '/login';
    }
  };

  if (isAuthPage) {
    return (
      <Tabs>
        <TabSlot
          style={{
            height: '100%',
          }}
        />

        <TabList style={styles.hidden}>
          <TabTrigger
            name="auth"
            href={pathname}
          />
        </TabList>
      </Tabs>
    );
  }

  return (
    <Tabs>

      <TabSlot
        style={{
          height: '100%',
        }}
      />

      {/* Navigation */}
      <TabList
        style={
          isMobile
            ? styles.tabListMobile
            : styles.tabList
        }
      >

        <Text
          style={
            isMobile
              ? styles.shopNameMobile
              : styles.shopName
          }
        >
          My Product Shop
        </Text>

        {/* Home */}
        <TabTrigger
          name="home"
          href="/"
          asChild
        >
          <Pressable
            style={
              isMobile
                ? styles.tabButtonMobile
                : styles.tabButton
            }
          >
            <Text
              style={
                isMobile
                  ? styles.tabTextMobile
                  : styles.tabText
              }
            >
              Home
            </Text>
          </Pressable>
        </TabTrigger>

        {/* Products */}
        <TabTrigger
          name="jsonProducts"
          href="/jsonProducts"
          asChild
        >
          <Pressable
            style={
              isMobile
                ? styles.tabButtonMobile
                : styles.tabButton
            }
          >
            <Text
              style={
                isMobile
                  ? styles.tabTextMobile
                  : styles.tabText
              }
            >
              Products
            </Text>
          </Pressable>
        </TabTrigger>

        {/* Add - Admin only */}
        {isAdmin && (
          <TabTrigger
            name="add"
            href="/add"
            asChild
          >
            <Pressable
              style={
                isMobile
                  ? styles.tabButtonMobile
                  : styles.tabButton
              }
            >
              <Text
                style={
                  isMobile
                    ? styles.tabTextMobile
                    : styles.tabText
                }
              >
                Add
              </Text>
            </Pressable>
          </TabTrigger>
        )}

        {/* Edit - Admin only */}
        {isAdmin && (
          <TabTrigger
            name="edit"
            href="/edit"
            asChild
          >
            <Pressable
              style={
                isMobile
                  ? styles.tabButtonMobile
                  : styles.tabButton
              }
            >
              <Text
                style={
                  isMobile
                    ? styles.tabTextMobile
                    : styles.tabText
                }
              >
                Edit
              </Text>
            </Pressable>
          </TabTrigger>
        )}

        {/* Profile */}
        <TabTrigger
          name="profile"
          href="/profile"
          asChild
        >
          <Pressable
            style={
              isMobile
                ? styles.tabButtonMobile
                : styles.tabButton
            }
          >
            <Text
              style={
                isMobile
                  ? styles.tabTextMobile
                  : styles.tabText
              }
            >
              Profile
            </Text>
          </Pressable>
        </TabTrigger>

      </TabList>

      {/* Logout */}
      <View
        style={
          isMobile
            ? styles.logoutWrapperMobile
            : styles.logoutWrapper
        }
      >
        <Pressable
          onPress={logout}
          style={
            isMobile
              ? styles.logoutButtonMobile
              : styles.logoutButton
          }
        >
          <Text
            style={
              isMobile
                ? styles.logoutTextMobile
                : styles.logoutText
            }
          >
            Logout
          </Text>
        </Pressable>
      </View>

    </Tabs>
  );
}

const styles = StyleSheet.create({

  /* =========================
     DESKTOP
  ========================= */

  tabList: {
    position: 'absolute',
    top: 10,
    left: '2%',
    width: '96%',
    minHeight: 52,

    borderRadius: 28,
    backgroundColor: '#F3F3F8',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 8,
    paddingVertical: 5,

    gap: 2,

    zIndex: 100,
  },

  shopName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginRight: 12,
  },

  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },

  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222222',
  },

  logoutWrapper: {
    position: 'absolute',
    top: 10,
    right: '3%',
    zIndex: 1000,
  },

  logoutButton: {
    backgroundColor: '#E53935',

    paddingHorizontal: 18,
    paddingVertical: 9,

    borderRadius: 20,

    minWidth: 80,

    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* =========================
     MOBILE
  ========================= */

  tabListMobile: {
    position: 'absolute',
    top: 5,
    left: '2%',
    width: '96%',
    minHeight: 44,

    borderRadius: 22,
    backgroundColor: '#F3F3F8',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 2,
    paddingVertical: 2,

    gap: 0,

    zIndex: 100,
  },

  shopNameMobile: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111111',
    marginRight: 3,
  },

  tabButtonMobile: {
    paddingHorizontal: 5,
    paddingVertical: 7,
    borderRadius: 18,
  },

  tabTextMobile: {
    fontSize: 10,
    fontWeight: '600',
    color: '#222222',
  },

  logoutWrapperMobile: {
    position: 'absolute',
    top: 7,
    right: '3%',
    zIndex: 1000,
  },

  logoutButtonMobile: {
    backgroundColor: '#E53935',

    paddingHorizontal: 9,
    paddingVertical: 7,

    borderRadius: 16,

    minWidth: 48,

    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutTextMobile: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  hidden: {
    display: 'none',
  },

});