import type { Content, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces'
import type { BuildingInfo } from '@/modules/building/interfaces/building-info.interface'
import type { EmployeeMovementItem } from '@/modules/building/interfaces/employee-movement-item.interface'
import type { EmployeeMovementReportTranslations } from '@/modules/building/interfaces/employee-movement-report-translations.interface'
import type { EmployeeReportInfo } from '@/modules/building/interfaces/employee-report-info.interface'
import type { EmployeeViolationItem } from '@/modules/building/interfaces/employee-violation-item.interface'

class EmployeeMovementReportService {
    async download(params: {
        building: BuildingInfo
        report: {
            employee: EmployeeReportInfo
            movements: EmployeeMovementItem[]
            violations: EmployeeViolationItem[]
        }
        date: string
        translations: EmployeeMovementReportTranslations
        locale: string
        isDark: boolean
    }) {
        const [{ default: pdfMake }, { default: pdfFonts }] = await Promise.all([
            import('pdfmake/build/pdfmake.js'),
            import('pdfmake/build/vfs_fonts.js')
        ])
        ;(pdfMake as unknown as { addVirtualFileSystem: (vfs: unknown) => void }).addVirtualFileSystem(pdfFonts)

        const palette = params.isDark
            ? {
                page: '#0b1220',
                card: '#111c31',
                cardSoft: '#16243d',
                text: '#f8fafc',
                muted: '#9aa7bd',
                line: '#26344f',
                brand: '#ffc529',
                brandText: '#050816',
                danger: '#fb7185'
            }
            : {
                page: '#f5f7fb',
                card: '#ffffff',
                cardSoft: '#eef3fb',
                text: '#101827',
                muted: '#64748b',
                line: '#d7deea',
                brand: '#d79a00',
                brandText: '#101827',
                danger: '#dc2626'
        }
        const employeeName = params.report.employee.full_name || params.report.employee.email
        const title = params.translations.title.replace('{name}', employeeName)
        const generatedAt = this.formatDateTime(new Date().toISOString(), params.locale)
        const documentDefinition: TDocumentDefinitions = {
            pageSize: 'A4',
            pageMargins: [34, 34, 34, 34],
            background: () => ({
                canvas: [{ type: 'rect', x: 0, y: 0, w: 595.28, h: 841.89, color: palette.page }]
            }),
            content: [
                this.createHeader(title, palette),
                this.createInfoTable(params, generatedAt, palette),
                this.createStatsGrid(params.report, params.translations, params.locale, palette),
                this.createHourlyChart(params.report.movements, params.translations, palette),
                this.createZoneScanChart(params.report.movements, params.translations, palette),
                this.createZoneDwellChart(params.report.movements, params.translations, palette),
                this.createViolationsTable(params.report.violations, params.translations, params.locale, palette)
            ],
            styles: {
                title: { fontSize: 23, bold: true, color: palette.text, lineHeight: 1.15 },
                sectionTitle: { fontSize: 13, bold: true, color: palette.text, margin: [0, 0, 0, 8] },
                label: { fontSize: 8, bold: true, color: palette.brand, characterSpacing: 0.7 },
                value: { fontSize: 10, bold: true, color: palette.text },
                muted: { fontSize: 8, color: palette.muted },
                statLabel: { fontSize: 7, bold: true, color: palette.brand, characterSpacing: 0.5 },
                statValue: { fontSize: 16, bold: true, color: palette.text },
                routeTime: { fontSize: 8, bold: true, color: palette.brand },
                routeZone: { fontSize: 9, bold: true, color: palette.text },
                routeMeta: { fontSize: 7, color: palette.muted },
                routeArrow: { fontSize: 13, bold: true, color: palette.brand },
                chartLabel: { fontSize: 8, bold: true, color: palette.text },
                chartValue: { fontSize: 8, bold: true, color: palette.brand },
                hourLabel: { fontSize: 5, color: palette.muted },
                tableHeader: { fontSize: 8, bold: true, color: palette.brand },
                tableCell: { fontSize: 8, color: palette.text }
            },
            defaultStyle: { font: 'Roboto', color: palette.text }
        }

        const filename = `employee-movement-report-${this.slugifyFileName(employeeName)}-${params.date}.pdf`
        const pdf = pdfMake.createPdf(documentDefinition) as unknown as {
            download: (fileName?: string) => void
        }
        pdf.download(filename)
    }

    private createHeader(
        title: string,
        palette: { brand: string; card: string; line: string }
    ): Content {
        return {
            table: {
                widths: ['*'],
                body: [[
                    {
                        stack: [
                            { text: title, style: 'title' },
                            { text: 'InZone', color: palette.brand, bold: true, fontSize: 9, margin: [0, 7, 0, 0] }
                        ],
                        fillColor: palette.card,
                        margin: [16, 10, 16, 12]
                    }
                ]]
            },
            layout: this.cardLayout(palette.line),
            margin: [0, 0, 0, 14]
        }
    }

    private createInfoTable(
        params: {
            building: BuildingInfo
            report: { employee: EmployeeReportInfo; movements: EmployeeMovementItem[]; violations: EmployeeViolationItem[] }
            date: string
            translations: EmployeeMovementReportTranslations
        },
        generatedAt: string,
        palette: { card: string; line: string }
    ): Content {
        const employeeName = params.report.employee.full_name || params.report.employee.email
        return {
            table: {
                widths: ['*', '*', '*'],
                body: [
                    [
                        this.infoCell(params.translations.building, params.building.title),
                        this.infoCell(params.translations.employee, employeeName),
                        this.infoCell(params.translations.date, params.date)
                    ],
                    [
                        this.infoCell(params.translations.generatedAt, generatedAt),
                        this.infoCell('Email', params.report.employee.email),
                        this.infoCell(params.translations.phone, params.report.employee.phone ?? '-')
                    ]
                ]
            },
            layout: this.filledCardLayout(palette.card, palette.line),
            margin: [0, 0, 0, 14]
        }
    }

    private infoCell(label: string, value: string): Content {
        return {
            stack: [
                { text: label, style: 'label' },
                { text: value || '-', style: 'value', margin: [0, 5, 0, 0] }
            ],
            margin: [10, 8, 10, 8]
        }
    }

    private createStatsGrid(
        report: { movements: EmployeeMovementItem[]; violations: EmployeeViolationItem[] },
        translations: EmployeeMovementReportTranslations,
        locale: string,
        palette: { cardSoft: string; line: string }
    ): Content {
        const uniqueFloors = new Set(report.movements.map((movement) => movement.floor_id)).size
        const uniqueZones = new Set(
            report.movements.flatMap((movement) => [movement.zone_from_id, movement.zone_to_id]).filter((zoneId) => zoneId !== null)
        ).size
        const firstScan = report.movements[0]?.created_at
        const lastScan = report.movements[report.movements.length - 1]?.created_at

        return {
            table: {
                widths: ['*', '*', '*', '*', '*', '*'],
                body: [[
                    this.statCell(translations.movements, String(report.movements.length)),
                    this.statCell(translations.violations, String(report.violations.length)),
                    this.statCell(translations.uniqueFloors, String(uniqueFloors)),
                    this.statCell(translations.uniqueZones, String(uniqueZones)),
                    this.statCell(translations.firstScan, firstScan ? this.formatTime(firstScan, locale) : '-'),
                    this.statCell(translations.lastScan, lastScan ? this.formatTime(lastScan, locale) : '-')
                ]]
            },
            layout: this.filledCardLayout(palette.cardSoft, palette.line),
            margin: [0, 0, 0, 18]
        }
    }

    private statCell(label: string, value: string): Content {
        return {
            stack: [
                { text: label, style: 'statLabel' },
                { text: value, style: 'statValue', margin: [0, 6, 0, 0] }
            ],
            margin: [8, 9, 8, 9]
        }
    }

    private createHourlyChart(
        movements: EmployeeMovementItem[],
        translations: EmployeeMovementReportTranslations,
        palette: { brand: string; muted: string; line: string }
    ): Content {
        const counts = Array.from({ length: 24 }, (_, hour) =>
            movements.filter((movement) => new Date(movement.created_at).getHours() === hour).length
        )
        const max = Math.max(1, ...counts)
        const chartWidth = 504
        const slotWidth = chartWidth / 24
        const barWidth = 12
        const chartHeight = 78
        const hourLabels: TableCell[] = Array.from({ length: 25 }, (_, hour) => ({
            text: String(hour).padStart(2, '0'),
            style: 'hourLabel',
            alignment: 'center',
            margin: [0, 0, 0, 0]
        }))
        const baseline = [{
            type: 'rect' as const,
            x: 0,
            y: chartHeight - 2,
            w: chartWidth,
            h: 2,
            color: palette.line
        }]
        const bars = counts
            .map((count, index) => {
                if (count === 0) return null
                const height = Math.max(6, (count / max) * chartHeight)
                return {
                type: 'rect' as const,
                x: Math.min(index * slotWidth, chartWidth - barWidth),
                y: chartHeight - height,
                w: barWidth,
                h: height,
                color: palette.brand
            }
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)

        return {
            stack: [
                { text: translations.hourlyActivity, style: 'sectionTitle' },
                { canvas: [...baseline, ...bars], margin: [0, 4, 0, 6] },
                {
                    table: {
                        widths: Array.from({ length: 25 }, () => '*'),
                        body: [hourLabels]
                    },
                    layout: 'noBorders'
                }
            ],
            margin: [0, 0, 0, 18]
        }
    }

    private createZoneScanChart(
        movements: EmployeeMovementItem[],
        translations: EmployeeMovementReportTranslations,
        palette: { card: string; cardSoft: string; line: string; brand: string }
    ): Content {
        const zoneCounts = new Map<string, number>()
        movements.forEach((movement) => {
            const zone = this.formatZone(movement.zone_to_id, translations)
            zoneCounts.set(zone, (zoneCounts.get(zone) ?? 0) + 1)
        })

        return this.createHorizontalBarChart(
            translations.zoneScanCount,
            this.compactChartEntries([...zoneCounts.entries()], translations),
            '',
            palette
        )
    }

    private createZoneDwellChart(
        movements: EmployeeMovementItem[],
        translations: EmployeeMovementReportTranslations,
        palette: { card: string; cardSoft: string; line: string; brand: string }
    ): Content {
        const sortedMovements = [...movements].sort(
            (first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime()
        )
        const zoneDurations = new Map<string, number>()

        sortedMovements.forEach((movement, index) => {
            const nextMovement = sortedMovements[index + 1]
            if (!nextMovement) return

            const durationMinutes = Math.max(
                0,
                (new Date(nextMovement.created_at).getTime() - new Date(movement.created_at).getTime()) / 60000
            )
            const zone = this.formatZone(movement.zone_to_id, translations)
            zoneDurations.set(zone, (zoneDurations.get(zone) ?? 0) + durationMinutes)
        })

        return this.createHorizontalBarChart(
            translations.zoneDwellTime,
            this.compactChartEntries([...zoneDurations.entries()], translations),
            ` ${translations.minutesShort}`,
            palette
        )
    }

    private createHorizontalBarChart(
        title: string,
        entries: Array<[string, number]>,
        unit: string,
        palette: { card: string; cardSoft: string; line: string; brand: string }
    ): Content {
        if (entries.length === 0) {
            return {
                stack: [
                    { text: title, style: 'sectionTitle' },
                    this.emptyState('-', palette)
                ],
                margin: [0, 0, 0, 18]
            }
        }

        const max = Math.max(1, ...entries.map(([, value]) => value))
        const chartWidth = 300

        return {
            stack: [
                { text: title, style: 'sectionTitle' },
                {
                    table: {
                        widths: [94, '*', 58],
                        body: entries.map(([label, value], index): TableCell[] => {
                            const width = Math.max(3, (value / max) * chartWidth)
                            const displayValue = Number.isInteger(value) ? String(value) : value.toFixed(1)
                            const fillColor = index % 2 === 0 ? palette.card : palette.cardSoft

                            return [
                                { text: label, style: 'chartLabel', margin: [8, 7, 8, 7], fillColor },
                                {
                                    canvas: [
                                        { type: 'rect', x: 0, y: 8, w: chartWidth, h: 8, color: palette.line },
                                        { type: 'rect', x: 0, y: 8, w: width, h: 8, color: palette.brand }
                                    ],
                                    margin: [0, 4, 0, 4],
                                    fillColor
                                },
                                {
                                    text: `${displayValue}${unit}`,
                                    style: 'chartValue',
                                    alignment: 'right',
                                    margin: [8, 7, 8, 7],
                                    fillColor
                                }
                            ]
                        })
                    },
                    layout: this.filledCardLayout(palette.card, palette.line)
                }
            ],
            margin: [0, 0, 0, 18]
        }
    }

    private compactChartEntries(entries: Array<[string, number]>, translations: EmployeeMovementReportTranslations) {
        const sortedEntries = entries
            .filter(([, value]) => value > 0)
            .sort(([, firstValue], [, secondValue]) => secondValue - firstValue)

        const visibleEntries = sortedEntries.slice(0, 8)
        const hiddenEntries = sortedEntries.slice(8)
        const hiddenValue = hiddenEntries.reduce((sum, [, value]) => sum + value, 0)

        if (hiddenValue > 0) {
            visibleEntries.push([translations.otherZones, hiddenValue])
        }

        return visibleEntries
    }

    private createViolationsTable(
        violations: EmployeeViolationItem[],
        translations: EmployeeMovementReportTranslations,
        locale: string,
        palette: { card: string; line: string; danger: string }
    ): Content {
        if (violations.length === 0) return this.emptyState(translations.noViolations, palette)

        return this.tableSection(
            translations.violationsTable,
            [translations.time, translations.titleColumn, translations.zone, translations.message],
            violations.map((violation) => [
                this.formatTime(violation.created_at, locale),
                violation.title,
                violation.zone.title,
                violation.message
            ]),
            palette
        )
    }

    private tableSection(
        title: string,
        headers: string[],
        rows: Array<Array<string | number>>,
        palette: { card: string; line: string }
    ): Content {
        return {
            stack: [
                { text: title, style: 'sectionTitle' },
                {
                    table: {
                        headerRows: 1,
                        widths: headers.map(() => '*'),
                        body: [
                            headers.map((text) => ({ text, style: 'tableHeader', margin: [5, 6, 5, 6] })),
                            ...rows.map((row) => row.map((text): TableCell => ({
                                text: String(text),
                                style: 'tableCell',
                                margin: [5, 6, 5, 6]
                            })))
                        ]
                    },
                    layout: this.filledCardLayout(palette.card, palette.line)
                }
            ],
            margin: [0, 0, 0, 16]
        }
    }

    private emptyState(text: string, palette: { card: string; line: string }): Content {
        return {
            table: {
                widths: ['*'],
                body: [[{ text, style: 'value', margin: [10, 10, 10, 10] }]]
            },
            layout: this.filledCardLayout(palette.card, palette.line),
            margin: [0, 0, 0, 16]
        }
    }

    private formatDateTime(value: string, locale: string) {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    }

    private formatTime(value: string, locale: string) {
        return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
    }

    private formatZone(zoneId: number | null, translations: EmployeeMovementReportTranslations) {
        return zoneId === null ? translations.outside : `${translations.zone} #${zoneId}`
    }

    private slugifyFileName(value: string) {
        return value
            .trim()
            .toLowerCase()
            .replace(/[^a-zа-яіїєґё0-9]+/gi, '-')
            .replace(/^-+|-+$/g, '') || 'employee'
    }

    private cardLayout(lineColor: string) {
        return {
            hLineColor: () => lineColor,
            vLineColor: () => lineColor,
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0
        }
    }

    private filledCardLayout(fillColor: string, lineColor: string) {
        return {
            ...this.cardLayout(lineColor),
            fillColor: () => fillColor
        }
    }
}

export const employeeMovementReportService = new EmployeeMovementReportService()
