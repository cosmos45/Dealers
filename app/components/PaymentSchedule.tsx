import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, DataTable } from 'react-native-paper';

export default function PaymentSchedule({ totalAmount, creditTerm, startDate }) {
  const generateSchedule = () => {
    const installments = [];
    const installmentAmount = totalAmount / (creditTerm / 15);
    
    for (let i = 0; i < creditTerm / 15; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (i * 15));
      
      installments.push({
        installmentNo: i + 1,
        amount: installmentAmount,
        dueDate: dueDate.toLocaleDateString(),
      });
    }
    
    return installments;
  };

  const schedule = generateSchedule();

  return (
    <Surface style={styles.container}>
      <Text style={styles.title}>Payment Schedule</Text>
      <DataTable>
        <DataTable.Header style={styles.tableHeader}>
          <DataTable.Title style={styles.numberColumn}>
            <Text style={styles.headerText}>No.</Text>
          </DataTable.Title>
          <DataTable.Title style={styles.amountColumn}>
            <Text style={styles.headerText}>Amount</Text>
          </DataTable.Title>
          <DataTable.Title style={styles.dateColumn}>
            <Text style={styles.headerText}>Due Date</Text>
          </DataTable.Title>
        </DataTable.Header>

        {schedule.map((installment) => (
          <DataTable.Row key={installment.installmentNo}>
            <DataTable.Cell style={styles.numberColumn}>
              <Text style={styles.cellText}>{installment.installmentNo}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.amountColumn}>
              <Text style={styles.cellText}>${installment.amount.toFixed(2)}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.dateColumn}>
              <Text style={styles.cellText}>{installment.dueDate}</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableHeader: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  cellText: {
    fontSize: 15,
    color: '#000000',
  },
  numberColumn: {
    flex: 0.5,
    paddingLeft: 16,
  },
  amountColumn: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dateColumn: {
    flex: 1.2,
    paddingLeft: 16,
  }
});
