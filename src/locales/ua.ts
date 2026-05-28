export const ua = {
    common: {
        title: 'InZone',
        forgotPassword: 'Забули пароль?',
        logoutConfirmTitle: 'Вийти з акаунту',
        logoutConfirmMessage: 'Ви впевнені, що хочете вийти з акаунту?',
        logoutConfirm: 'Вийти',
        logoutCancel: 'Скасувати',
        userNameLabel: 'Користувач',
        userNamePlaceholder: "Введіть ваше ім'я",
        emailLabel: 'Електронна пошта',
        emailPlaceholder: 'Введіть вашу електронну пошту',
        passwordLabel: 'Пароль',
        passwordPlaceholder: 'Введіть ваш пароль',
        roles: {
            'organization-admin': 'Адмін організації',
            'tag-admin': 'Адмін тегів',
            employee: 'Співробітник'
        },
        rolesDescription: {
            'organization-admin': 'Створюйте власні організації та керуйте ними',
            'tag-admin': 'Призначайте та відзначайте теги співробітникам',
            'global-admin': 'Повний контроль над системою',
            employee: 'Приєднуйтесь до організацій як співробітник'
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
    joinOrganization: {
        title: 'Приєднання до організації',
        description: 'Підтвердьте згоду на обробку даних. Після цього ми відкриємо Android застосунок InZone і приєднаємо вас до організації без додаткових дій.',
        consent: 'Я погоджуюсь, що InZone може обробляти мої дані та використовувати відстеження у межах організацій, до яких я приєднуюсь.',
        openInApp: 'Відкрити в застосунку',
        confirm: 'Приєднатися',
        success: 'Згоду надано. Організацію додано до вашого акаунту. Можете повернутися до Android застосунку.',
        missingToken: 'Посилання запрошення некоректне або без токена.',
        androidRequired: 'Після підтвердження згоди відкриється Android застосунок InZone. Він передасть токен співробітника і безпечно приєднає вас до організації.',
        loadFailed: 'Не вдалося перевірити статус згоди.',
        joinFailed: 'Не вдалося приєднатися до організації.'
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
    tagAdminPanel: {
        organization: {
            title: 'Організація',
            descriptionFallback: 'Опис відсутній',
            nameLabel: 'Назва організації',
            descriptionLabel: 'Опис',
            createdAtLabel: 'Створено'
        },
        table: {
            title: 'Співробітники',
            searchPlaceholder: 'Пошук співробітників...',
            empty: 'Співробітників не знайдено',
            loading: 'Завантаження співробітників...',
            headers: {
                user: 'Користувач',
                tagStatus: 'Призначений тег',
                phone: 'Телефон',
                createdAt: 'Дата створення'
            },
            tagAssigned: 'Тег призначено',
            tagMissing: 'Тег не призначено',
            employeeRole: 'Співробітник'
        },
        memberInfo: {
            title: 'Інформація про співробітника',
            empty: 'Оберіть співробітника в таблиці, щоб переглянути деталі.',
            email: 'Електронна пошта',
            phone: 'Телефон',
            createdAt: 'Створено',
            viewPositions: 'Переглянути позиції',
            assignTag: 'Призначити тег',
            unassignTag: 'Відвʼязати тег'
        },
        tagModal: {
            title: 'RFID-тег співробітника',
            assignedTitle: 'Призначений тег',
            emptyAssigned: 'Перетягніть тег сюди',
            searchPlaceholder: 'Пошук тегів...',
            emptyAvailable: 'Доступних тегів не знайдено',
            loading: 'Завантаження тегів...',
            name: 'Назва',
            tagUid: 'UID тегу',
            createdAt: 'Створено'
        },
        errors: {
            server: 'Сталася проблема на сервері. Спробуйте ще раз трохи пізніше.'
        }
    },
    organizationAdmin: {
        actions: {
            createOrganization: 'Створити організацію',
            createOrganizationHint: 'Створіть нову організацію та керуйте нею зі списку нижче.'
        },
        table: {
            searchPlaceholder: 'Пошук організацій...',
            empty: 'Нічого не знайдено',
            loading: 'Завантаження даних...',
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
                    user: 'Користувач',
                    role: 'Роль',
                    email: 'Електронна пошта',
                    phone: 'Телефон',
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
        },
        buildingPage: {
            floors: {
                title: 'Поверхи',
                collapse: 'Згорнути',
                expand: 'Розгорнути',
                expandHint: 'Розгорніть, щоб взаємодіяти з поверхами',
                add: 'Додати поверх',
                searchPlaceholder: 'Пошук поверхів...',
                empty: 'Нічого не знайдено',
                loading: 'Завантаження даних...',
                headers: {
                    position: 'Позиція',
                    name: 'Назва',
                    actions: 'Дії'
                }
            },
            employees: {
                title: 'Співробітники',
                searchPlaceholder: 'Пошук співробітників...',
                empty: 'На цьому поверсі зараз немає співробітників',
                loading: 'Завантаження даних...',
                headers: {
                    user: 'Користувач',
                    actions: 'Дії'
                }
            },
            employeeMovementReport: {
                title: 'Звіт про переміщення за день співробітника {name}',
                dateLabel: 'Дата звіту',
                download: 'Завантажити',
                cancel: 'Скасувати',
                generatedAt: 'Згенеровано',
                building: 'Будівля',
                employee: 'Співробітник',
                phone: 'Телефон',
                date: 'Дата',
                movements: 'Переміщення',
                violations: 'Порушення',
                uniqueFloors: 'Поверхи',
                uniqueZones: 'Зони',
                firstScan: 'Перший скан',
                lastScan: 'Останній скан',
                noMovements: 'За цю дату переміщень немає.',
                noViolations: 'За цю дату порушень немає.',
                movementTable: 'Події переміщення',
                zoneScanCount: 'Сканування по зонах',
                zoneDwellTime: 'Час перебування по зонах',
                otherZones: 'Інші зони',
                minutesShort: 'хв',
                violationsTable: 'Порушення',
                hourlyActivity: 'Активність по годинах',
                scanId: 'Скан',
                time: 'Час',
                door: 'Двері',
                floor: 'Поверх',
                fromZone: 'Звідки',
                toZone: 'Куди',
                outside: 'Поза зонами',
                moreMovements: 'Ще переміщень: {count}',
                titleColumn: 'Назва',
                message: 'Повідомлення',
                zone: 'Зона'
            },
            info: {
                label: 'Будівля',
                emptyAddress: 'Адресу не вказано',
                createdAt: 'Створено'
            },
            floorForm: {
                createTitle: 'Додати поверх',
                editTitle: 'Редагувати поверх',
                nameLabel: 'Назва поверху',
                namePlaceholder: 'Введіть назву поверху',
                createConfirm: 'Додати',
                editConfirm: 'Зберегти',
                cancel: 'Скасувати'
            },
            zone: {
                defaultTitle: 'Нова зона',
                editingTitle: 'Режим редагування назви кімнати'
            },
            preview: {
                blockedZoneCollision: 'Зони "{first}" та "{second}" впираються одна в одну',
                blockedDoorBetween: 'Не вистачить місця дверей між "{first}" та "{second}"',
                blockedEntranceDoor: 'Не вистачить місця для вхідних дверей у "{zone}"'
            },
            map: {
                syncError: 'Не вдалося синхронізувати карту з сервером. Перевірте зʼєднання та спробуйте ще раз.'
            },
            serverError: 'Сталася проблема на сервері. Спробуйте ще раз трохи пізніше.',
            zoneForm: {
                title: 'Створити зону',
                nameLabel: 'Назва зони',
                namePlaceholder: 'Введіть назву зони',
                regular: 'Звичайна',
                transition: 'Міжповерхова',
                regularOnly: 'У цьому місці можна створити лише звичайну зону.',
                defaultError: 'Не вдалося створити зону в цьому місці.',
                overlapError: 'Зони впираються одна в одну. Оберіть вільне місце або збільшіть простір.',
                noIntersectionError: 'Нова зона має торкатися іншої зони.',
                doorSpaceError: 'Не вистачає місця для дверей між зонами.',
                confirm: 'Створити',
                cancel: 'Скасувати'
            },
            deleteBuilding: {
                title: 'Видалити будівлю',
                message: 'Видалення будівлі прибере всі її поверхи, зони та двері.',
                confirm: 'Видалити',
                cancel: 'Скасувати'
            },
            deleteFloor: {
                title: 'Видалити поверх',
                message: 'Поверх буде видалено разом із його зонами.',
                confirm: 'Видалити',
                cancel: 'Скасувати'
            },
            deleteZone: {
                title: 'Видалити зону',
                message: 'Зону буде видалено разом із її дверима.',
                confirm: 'Видалити',
                cancel: 'Скасувати'
            },
            deleteDoor: {
                title: 'Видалити двері',
                message: 'Двері буде видалено.',
                confirm: 'Видалити',
                cancel: 'Скасувати'
            },
            doorReader: {
                title: 'Рідер дверей',
                assignedTitle: 'Призначений рідер',
                emptyAssigned: 'Перетягніть рідер сюди',
                searchPlaceholder: 'Пошук рідерів...',
                hint: 'Створюйте рідери або перетягуйте доступний рідер у призначену область.',
                add: 'Додати рідер',
                name: 'Назва',
                createdAt: 'Створено',
                actions: 'Дії',
                tokenLabel: 'Новий токен',
                copySuccess: 'Токен скопійовано',
                editNamePrompt: 'Назва рідера',
                regenerateTitle: 'Перегенерувати токен',
                regenerateMessage: 'Поточний токен рідера перестане працювати після перегенерації.',
                regenerateConfirm: 'Перегенерувати',
                regenerateCancel: 'Скасувати'
            },
            readerForm: {
                createTitle: 'Додати рідер',
                editTitle: 'Редагувати рідер',
                nameLabel: 'Назва рідера',
                namePlaceholder: 'Введіть назву рідера',
                createConfirm: 'Додати',
                editConfirm: 'Зберегти',
                cancel: 'Скасувати'
            },
            zoneAccessRules: {
                rulesTitle: 'Правила доступу зони',
                positionsTitle: 'Позиції правила',
                edit: 'Редагувати правила',
                editPositions: 'Редагувати позиції',
                zoneInTitle: ' у зоні',
                close: 'Закрити',
                finish: 'Завершити',
                addRule: 'Додати правило',
                addPosition: 'Додати позицію',
                assigned: 'Призначені',
                available: 'Доступні',
                assignedSearch: 'Пошук призначених...',
                availableSearch: 'Пошук доступних...',
                empty: 'Нічого не знайдено',
                loading: 'Завантаження даних...',
                rule: 'Правило',
                role: 'Роль',
                createdAt: 'Створено',
                actions: 'Дії',
                backToEditRules: 'Назад до редагування правил',
                detachConfirmTitle: 'Відзначити правило',
                detachConfirmMessage: 'До цього правила призначені позиції. При відзначенні правила від зони ці призначення позицій також буде скинуто.',
                detachConfirm: 'Відзначити',
                deleteRuleTitle: 'Видалити правило',
                deleteRuleMessage: 'Це правило буде видалено.',
                deletePositionTitle: 'Видалити позицію',
                deletePositionMessage: 'Цю позицію буде видалено.',
                delete: 'Видалити',
                cancel: 'Скасувати',
                save: 'Зберегти',
                createRule: 'Створити правило',
                editRule: 'Редагувати правило',
                ruleTitle: 'Назва',
                accessType: 'Тип доступу',
                accessTypeForbidden: 'Заборонено',
                accessTypeTimeLimited: 'Обмежено в часі',
                maxDuration: 'Максимальна тривалість',
                createPosition: 'Створити позицію',
                editPosition: 'Редагувати позицію',
                description: 'Опис'
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
