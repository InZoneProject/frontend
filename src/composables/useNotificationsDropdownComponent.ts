export function useNotificationsDropdownComponent(emit: (event: 'load-more') => void) {
    const handleScroll = (event: Event) => {
        const element = event.currentTarget as HTMLElement
        if (element.scrollTop + element.clientHeight >= element.scrollHeight - 24) {
            emit('load-more')
        }
    }

    return {
        handleScroll
    }
}
