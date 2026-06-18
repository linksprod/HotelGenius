import { useTranslation } from 'react-i18next';

export const getCleanTranslationKey = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const useTranslatedServices = () => {
  const { t } = useTranslation();

  const translateCategory = (name: string): string => {
    const key = `profilePage.servicesList.categories.${getCleanTranslationKey(name)}`;
    return t(key, name);
  };

  const translateCategoryDescription = (name: string, defaultDesc: string): string => {
    const key = `profilePage.servicesList.categories.${getCleanTranslationKey(name)}Description`;
    return t(key, defaultDesc);
  };

  const translateItemName = (name: string): string => {
    const key = `profilePage.servicesList.items.${getCleanTranslationKey(name)}.name`;
    return t(key, name);
  };

  const translateItemDescription = (name: string, defaultDesc: string): string => {
    const key = `profilePage.servicesList.items.${getCleanTranslationKey(name)}.description`;
    return t(key, defaultDesc);
  };

  return { 
    translateCategory, 
    translateCategoryDescription, 
    translateItemName, 
    translateItemDescription 
  };
};
