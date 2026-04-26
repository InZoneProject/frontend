export const ua = {
    common: {
        title: 'InZone',
        forgotPassword: 'Забули пароль?',
        userNameLabel: 'Користувач',
        userNamePlaceholder: "Введіть ваше ім'я",
        emailLabel: 'Електронна пошта',
        emailPlaceholder: 'Введіть вашу електронну пошту',
        passwordLabel: 'Пароль',
        passwordPlaceholder: 'Введіть ваш пароль',
        roles: {
            'organization-admin': 'Адмін організації',
            'tag-admin': 'Адмін тегів'
        },
        rolesDescription: {
            'organization-admin': 'Створюйте власні організації та керуйте ними',
            'tag-admin': 'Призначайте та відзначайте теги співробітникам',
            'global-admin': 'Повний контроль над системою'
        },
        errors: {
            invalidEmail: 'Некоректний формат пошти',
            invalidPhone: 'Некоректний формат номера телефону',
            shortPassword: 'Пароль має бути не менше 6 символів',
            unauthorized: 'Невірний логін або пароль',
            invalidToken: 'Некоректний або відсутній токен запрошення',
            emailConflict: 'Ця електронна пошта вже використовується',
            passwordMismatch: 'Паролі не співпадають',
            passwordSameAsCurrent: 'Новий пароль не може співпадати з поточним',
            unexpected: 'Сталася непередбачувана помилка'
        }
    },
    login: {
        submitRole: 'Увійти'
    },
    register: {
        submitRole: 'Реєстрація'
    },
    globalAdmin: {
        inviteSection: {
            title: 'Генерація запрошення',
            activeTitle: 'Запрошення готове',
            description: 'Створіть унікальне посилання для реєстрації нового адміністратора організації. Посилання має обмежений час дії.',
            activeDescription: 'Скопіюйте посилання та надішліть його адміністратору. Воно буде дійсним лише протягом вказаного часу.',
            generateBtn: 'Згенерувати посилання',
            linkActive: 'Посилання активне:',
            expiresIn: 'Спливає через:',
            copyBtn: 'Копіювати',
            copySuccess: 'Посилання успішно скопійовано',
            deleteBtn: 'Видалити посилання'
        },
        tabs: {
            admins: 'Адміністратори',
            history: 'Історія запрошень'
        },
        table: {
            searchPlaceholder: "Пошук за поштою або ім'ям...",
            empty: 'Нічого не знайдено',
            loading: 'Завантаження даних...',
            headers: {
                name: 'Користувач',
                phone: 'Номер телефону',
                email: 'Електронна пошта',
                organization: 'Кількість організацій',
                createdAt: 'Дата створення',
                usedAt: 'Використано',
                usedBy: 'Хто використав',
                expiresAt: 'Термін дії',
                validityPeriod: 'Термін дії',
                actions: 'Дії'
            }
        },
        modals: {
            deleteAdmin: {
                title: 'Видалення адміністратора',
                message: 'Ви впевнені, що хочете видалити цього адміністратора? Цю дію неможливо скасувати.',
                confirm: 'Видалити',
                cancel: 'Скасувати'
            }
        }
    },
    organizationAdmin: {
        actions: {
            createOrganization: 'Створити організацію',
            createOrganizationHint: 'Створіть нову організацію та керуйте нею зі списку нижче.'
        },
        table: {
            searchPlaceholder: 'Пошук організацій...',
            headers: {
                title: 'Назва',
                description: 'Опис',
                createdAt: 'Створено',
                actions: 'Дії'
            }
        },
        modals: {
            organizationForm: {
                createTitle: 'Створення організації',
                editTitle: 'Редагування організації',
                nameLabel: 'Назва організації',
                namePlaceholder: 'Введіть назву організації',
                descriptionLabel: 'Опис',
                descriptionPlaceholder: 'Введіть опис організації',
                createConfirm: 'Створити',
                editConfirm: 'Зберегти',
                cancel: 'Скасувати'
            },
            deleteOrganization: {
                title: 'Видалення організації',
                message: 'Ви впевнені, що хочете видалити цю організацію? Цю дію неможливо скасувати.',
                confirm: 'Видалити',
                cancel: 'Скасувати'
            }
        },
        page: {
            backToList: 'Повернутися до списку організацій',
            infoTitle: 'Інформація про організацію',
            infoDescriptionFallback: 'Опис відсутній',
            listsTitle: 'Дані організації',
            tabs: {
                employeesInvite: 'Запрошення співробітника',
                tagAdminInvite: 'Запрошення тег-адміна',
                buildings: 'Будівлі',
                members: 'Співробітники',
                tags: 'RFID теги'
            },
            inviteSection: {
                title: 'Генерація запрошення',
                activeTitle: 'Запрошення готове',
                description: 'Згенеруйте та надішліть запрошення для цієї організації.',
                activeDescription: 'Скопіюйте посилання та надішліть користувачу. Воно має обмежений час дії.',
                generateBtn: 'Згенерувати посилання',
                linkActive: 'Посилання активне:',
                expiresIn: 'Спливає через:',
                copyBtn: 'Копіювати',
                copySuccess: 'Посилання успішно скопійовано',
                deleteBtn: 'Видалити посилання'
            },
            infoForm: {
                nameLabel: 'Назва організації',
                descriptionLabel: 'Опис',
                createdAtLabel: 'Створено',
                editButton: 'Редагувати',
                deleteButton: 'Видалити'
            },
            table: {
                searchPlaceholder: 'Пошук будівель або тегів...',
                membersSearchPlaceholder: 'Пошук співробітників...',
                addBuilding: 'Додати будівлю',
                addBuildingHint: 'Створюйте нові будівлі та керуйте ними у списку нижче.',
                addTag: 'Додати тег',
                addTagHint: 'Створюйте RFID теги та редагуйте їх назви у таблиці нижче.',
                headers: {
                    name: 'Назва',
                    role: 'Роль',
                    email: 'Електронна пошта',
                    createdAt: 'Створено',
                    address: 'Адреса',
                    tagUid: 'UID тега',
                    actions: 'Дії'
                },
                roleLabels: {
                    organizationAdmin: 'Адмін організації',
                    tagAdmin: 'Адмін тегів',
                    employee: 'Співробітник'
                },
                showUid: 'Показати',
                hideUid: 'Сховати',
                hiddenUid: 'Приховано'
            },
            memberInfo: {
                title: 'Інформація про учасника',
                empty: 'Оберіть учасника в таблиці, щоб переглянути деталі.',
                email: 'Електронна пошта',
                phone: 'Телефон',
                createdAt: 'Створено',
                viewPositions: 'Переглянути позиції'
            },
            memberPositions: {
                backToInfo: 'До особистої інформації',
                editPositions: 'Редагувати позиції',
                finish: 'Завершити',
                addPosition: 'Додати позицію',
                assignedTitle: 'Призначені позиції',
                availableTitle: 'Доступні позиції',
                assignedSearchPlaceholder: 'Пошук призначених позицій...',
                availableSearchPlaceholder: 'Пошук доступних позицій...',
                emptyAssigned: 'У співробітника ще немає позицій.',
                emptyAvailable: 'Немає доступних позицій для призначення.'
            },
            modals: {
                expelMember: {
                    title: 'Вигнання учасника',
                    messageEmployee: 'Ви впевнені, що хочете вигнати співробітника',
                    messageTagAdmin: 'Ви впевнені, що хочете вигнати адміна тегів',
                    confirm: 'Вигнати',
                    cancel: 'Скасувати'
                },
                buildingForm: {
                    createTitle: 'Створити будівлю',
                    editTitle: 'Редагувати будівлю',
                    nameLabel: 'Назва будівлі',
                    namePlaceholder: 'Введіть назву будівлі',
                    addressLabel: 'Адреса',
                    addressPlaceholder: 'Введіть адресу',
                    createConfirm: 'Створити',
                    editConfirm: 'Зберегти',
                    cancel: 'Скасувати'
                },
                deleteBuilding: {
                    title: 'Видалення будівлі',
                    message: 'Ви впевнені, що хочете видалити цю будівлю? Цю дію неможливо скасувати.',
                    confirm: 'Видалити',
                    cancel: 'Скасувати'
                },
                tagForm: {
                    createTitle: 'Створити RFID тег',
                    editTitle: 'Редагувати RFID тег',
                    nameLabel: 'Назва тега',
                    namePlaceholder: 'Введіть назву тега',
                    tagUidLabel: 'UID тега',
                    tagUidPlaceholder: 'Введіть UID тега',
                    createConfirm: 'Створити',
                    editConfirm: 'Зберегти',
                    cancel: 'Скасувати'
                },
                deleteTag: {
                    title: 'Видалення RFID тега',
                    message: 'Ви впевнені, що хочете видалити цей RFID тег? Цю дію неможливо скасувати.',
                    confirm: 'Видалити',
                    cancel: 'Скасувати'
                },
                positionForm: {
                    createTitle: 'Створити позицію',
                    editTitle: 'Редагувати позицію',
                    roleLabel: 'Назва позиції',
                    rolePlaceholder: 'Введіть назву позиції',
                    descriptionLabel: 'Опис',
                    descriptionPlaceholder: 'Введіть опис позиції',
                    createConfirm: 'Створити',
                    editConfirm: 'Зберегти',
                    cancel: 'Скасувати'
                },
                deletePosition: {
                    title: 'Видалення позиції',
                    message: 'Ви впевнені, що хочете видалити цю позицію? Цю дію неможливо скасувати.',
                    confirm: 'Видалити',
                    cancel: 'Скасувати'
                }
            }
        }
    },
    verification: {
        title: 'Верифікація',
        initialDescription: 'Натисніть кнопку нижче, щоб отримати 6-значний код підтвердження на вашу пошту.',
        sentDescription: 'Ми надіслали 6-значний код підтвердження на вашу електронну пошту.',
        timerLabel: 'Спливає через',
        sendBtn: 'Надіслати код',
        sentBtn: 'Код надіслано',
        backBtn: 'Повернутися до входу',
        errors: {
            alreadySent: 'Код уже надіслано. Будь ласка, зачекайте перед наступним запитом.',
            invalidCode: 'Невірний код підтвердження'
        }
    },
    forgotPassword: {
        initialDescription: 'Введіть пошту вашого акаунта і натисніть кнопку, щоб отримати лист для скидання пароля.',
        sentDescription: 'Ми надіслали лист для скидання пароля на вашу електронну пошту.',
        timerLabel: 'Повторний запит через',
        sendBtn: 'Надіслати лист',
        sentBtn: 'Лист надіслано',
        backBtn: 'Повернутися до входу',
        errors: {
            alreadySent: 'Лист для скидання пароля вже активний. Зачекайте завершення таймера.',
            notFound: 'Користувача з такою поштою не знайдено',
            unexpected: 'Сталася непередбачувана помилка'
        }
    },
    resetPassword: {
        title: 'Скидання пароля',
        description: 'Створіть новий пароль для акаунта та підтвердіть його нижче.',
        submitBtn: 'Змінити пароль',
        errors: {
            invalidToken: 'Некоректний або прострочений токен скидання пароля',
            unexpected: 'Сталася непередбачувана помилка'
        }
    },
    notifications: {
        title: 'Сповіщення',
        markAllRead: 'Позначити всі як прочитані',
        empty: 'Поки що немає сповіщень'
    },
    profile: {
        photoHint: 'Фото профілю',
        nameLabel: "Ім'я",
        namePlaceholder: "Введіть ваше ім'я",
        emailLabel: 'Електронна пошта',
        phoneLabel: 'Номер телефону',
        phonePlaceholder: 'Введіть номер телефону',
        save: 'Зберегти',
        cancel: 'Скасувати',
        deleteAccount: 'Видалити акаунт',
        deleteConfirmTitle: 'Видалення акаунту',
        deleteConfirmMessage: 'Ви впевнені, що хочете видалити свій акаунт? Цю дію неможливо скасувати.',
        deleteConfirm: 'Видалити',
        deleteCancel: 'Скасувати',
        errors: {
            invalidPhone: 'Некоректний формат номера телефону',
            loadFailed: 'Не вдалося завантажити дані профілю',
            saveFailed: 'Не вдалося зберегти зміни профілю',
            uploadFailed: 'Не вдалося завантажити фото',
            deleteFailed: 'Не вдалося видалити акаунт'
        },
        success: {
            saved: 'Профіль успішно оновлено'
        }
    }
}
