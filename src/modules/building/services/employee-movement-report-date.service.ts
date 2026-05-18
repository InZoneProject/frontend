class EmployeeMovementReportDateService {
    public getWeekdayLabels(locale: string, daysInWeek: number) {
        const weekStart = this.getCurrentWeekMonday()

        return Array.from({ length: daysInWeek }, (_, index) =>
            new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
                new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index)
            )
        )
    }

    public toDate(value: string) {
        const [year, month, day] = value.split('-').map(Number)
        return new Date(year, month - 1, day || 1)
    }

    public toDateValue(date: Date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0')
        ].join('-')
    }

    public toMonthValue(date: Date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0')
        ].join('-')
    }

    private getCurrentWeekMonday() {
        const today = new Date()
        const mondayOffset = (today.getDay() + 6) % 7

        return new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset)
    }
}

export const employeeMovementReportDateService = new EmployeeMovementReportDateService()
