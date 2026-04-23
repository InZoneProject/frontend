import type {CommonTranslations} from "@/interfaces/common-translations.interface";
import type {RegisterTranslations} from "@/modules/register/interfaces/register-translations.interface";
import {UserRole} from "@/enums/user-role.enum";

export interface RegisterFormProperties {
    commonTranslations: CommonTranslations
    registerTranslations: RegisterTranslations
    initialRole: UserRole
}