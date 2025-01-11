import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, TextInput, Button, Menu, Chip } from 'react-native-paper';

interface FilterProps {
  onFilterChange: (filters: {
    search: string;
    date: string;
    status: string;
  }) => void;
}

export default function DealFilters({ onFilterChange }: FilterProps) {
  const [dateMenuVisible, setDateMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    search: '',
    date: 'All Time',
    status: 'All'
  });

  const dateRanges = [
    'Today',
    'This Week',
    'This Month',
    'Last Month',
    'All Time'
  ];

  const statuses = ['All', 'Paid', 'Pending', 'Credit'];

  const handleFilterChange = (type: string, value: string) => {
    const newFilters = { ...selectedFilters, [type]: value };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Surface style={styles.container}>
      <TextInput
        placeholder="Search by customer name..."
        value={selectedFilters.search}
        onChangeText={(text) => handleFilterChange('search', text)}
        mode="outlined"
        style={styles.searchInput}
        outlineColor="#E0E0E0"
        activeOutlineColor="#007BFF"
        left={<TextInput.Icon icon="magnify" color="#007BFF" />}
      />

      <View style={styles.filterButtons}>
        <View style={styles.menuContainer}>
          <Menu
            visible={dateMenuVisible}
            onDismiss={() => setDateMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setDateMenuVisible(true)}
                style={[styles.filterButton, styles.dateButton]}
                icon="calendar"
                contentStyle={styles.buttonContent}
                textColor="#007BFF"
              >
                {selectedFilters.date}
              </Button>
            }
            contentStyle={styles.menuContent}
            style={styles.menu}
          >
            {dateRanges.map((range) => (
              <Menu.Item
                key={range}
                onPress={() => {
                  handleFilterChange('date', range);
                  setDateMenuVisible(false);
                }}
                title={range}
                titleStyle={[
                  styles.menuItemText,
                  selectedFilters.date === range && styles.selectedMenuItemText
                ]}
                style={[
                  styles.menuItem,
                  selectedFilters.date === range && styles.selectedMenuItem
                ]}
              />
            ))}
          </Menu>
        </View>

        <View style={styles.menuContainer}>
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setStatusMenuVisible(true)}
                style={[styles.filterButton, styles.statusButton]}
                icon="filter-variant"
                contentStyle={styles.buttonContent}
                textColor="#007BFF"
              >
                {selectedFilters.status}
              </Button>
            }
            contentStyle={styles.menuContent}
            style={styles.menu}
          >
            {statuses.map((status) => (
              <Menu.Item
                key={status}
                onPress={() => {
                  handleFilterChange('status', status);
                  setStatusMenuVisible(false);
                }}
                title={status}
                titleStyle={[
                  styles.menuItemText,
                  selectedFilters.status === status && styles.selectedMenuItemText
                ]}
                style={[
                  styles.menuItem,
                  selectedFilters.status === status && styles.selectedMenuItem
                ]}
              />
            ))}
          </Menu>
        </View>
      </View>

      <View style={styles.activeFilters}>
        {Object.entries(selectedFilters).map(([key, value]) => (
          value !== 'All' && value !== 'All Time' && value !== '' ? (
            <Chip
              key={key}
              onClose={() => {
                const defaultValue = key === 'date' ? 'All Time' : key === 'status' ? 'All' : '';
                handleFilterChange(key, defaultValue);
              }}
              style={styles.filterChip}
              textStyle={styles.chipText}
              closeIconColor="#007BFF"
            >
              {value}
            </Chip>
          ) : null
        ))}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  menuContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterButton: {
    borderColor: '#007BFF',
    borderWidth: 1,
  },
  dateButton: {
    marginRight: 4,
  },
  statusButton: {
    marginLeft: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
  },
  menu: {
    elevation: 4,
  },
  menuItem: {
    height: 48,
    justifyContent: 'center',
  },
  selectedMenuItem: {
    backgroundColor: '#E3F2FD',
  },
  menuItemText: {
    color: '#000000',
    fontSize: 16,
  },
  selectedMenuItemText: {
    color: '#007BFF',
    fontWeight: '600',
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  filterChip: {
    backgroundColor: '#E3F2FD',
  },
  chipText: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '500',
  }
});
