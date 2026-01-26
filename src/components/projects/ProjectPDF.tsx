import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { calculateItemUnitPrice } from '@/lib/calculations';

// Register font
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
});

const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: 'Roboto' },
    header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 10 },
    title: { fontSize: 24, marginBottom: 5 },
    subtitle: { fontSize: 12, color: 'gray' },
    table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
    tableRow: { margin: 'auto', flexDirection: 'row' },
    tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
    tableColSmall: { width: '10%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
    tableColLarge: { width: '40%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
    tableCell: { margin: 5, fontSize: 10 },
    tableHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
    total: { marginTop: 20, textAlign: 'right', fontSize: 14, fontWeight: 'bold' }
});

export const ProjectPDF = ({ project }: { project: any }) => {
    // Calculate total sum for the header/footer
    const totalSum = project.items?.reduce((acc: number, item: any) => {
        const unit = calculateItemUnitPrice(item);
        return acc + (unit * (item.quantity || 1));
    }, 0) || 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Коммерческое Предложение</Text>
                    <Text style={styles.subtitle}>Проект: {project.name}</Text>
                    <Text style={styles.subtitle}>Заказчик: {project.customer?.name}</Text>
                    <Text style={styles.subtitle}>Дата: {new Date().toLocaleDateString('ru-RU')}</Text>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableColLarge, styles.tableHeader]}>
                            <Text style={styles.tableCell}>Наименование</Text>
                        </View>
                        <View style={[styles.tableCol, styles.tableHeader]}>
                            <Text style={styles.tableCell}>Параметры</Text>
                        </View>
                        <View style={[styles.tableColSmall, styles.tableHeader]}>
                            <Text style={styles.tableCell}>Кол-во</Text>
                        </View>
                        <View style={[styles.tableCol, styles.tableHeader]}>
                            <Text style={styles.tableCell}>Сумма</Text>
                        </View>
                    </View>

                    {project.items?.map((item: any, index: number) => {
                        const unitPrice = calculateItemUnitPrice(item);
                        const total = unitPrice * (item.quantity || 1);

                        return (
                            <View style={styles.tableRow} key={index}>
                                <View style={styles.tableColLarge}>
                                    <Text style={styles.tableCell}>{item.template?.name || 'Товар'}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>
                                        {item.params && Object.entries(item.params).map(([k, v]) => `${k}:${v}`).join(', ')}
                                    </Text>
                                </View>
                                <View style={styles.tableColSmall}>
                                    <Text style={styles.tableCell}>{item.quantity}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>
                                        {total.toLocaleString('ru-RU')}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.total}>
                    <Text>Итого: {totalSum.toLocaleString('ru-RU')} ₸</Text>
                </View>
            </Page>
        </Document>
    );
};
