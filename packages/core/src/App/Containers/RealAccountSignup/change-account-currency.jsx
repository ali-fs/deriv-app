import { Field, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import { FormSubmitButton, Text } from '@deriv/components';
import { getCurrencyDisplayCode, isMobile, reorderCurrencies } from '@deriv/shared';
import { connect } from 'Stores/connect';
import { localize, Localize } from '@deriv/translations';
import { CurrencyRadioButtonGroup, CurrencyRadioButton } from '@deriv/account';
import './currency-selector.scss';

const FIAT_CURRENCY_TYPE = 'fiat';

const ChangeAccountCurrency = ({
    legal_allowed_currencies,
    value,
    onSubmit,
    form_error,
    can_change_fiat_currency,
    client_currency,
    current_currency_type,
    current_fiat_currency,
}) => {
    const getReorderedCurrencies = () =>
        reorderCurrencies(legal_allowed_currencies.filter(currency => currency.type === FIAT_CURRENCY_TYPE));

    return (
        <Formik
            initialValues={{
                fiat: value.fiat,
            }}
            onSubmit={(values, actions) => {
                onSubmit(false, values, actions.setSubmitting);
            }}
        >
            {({ handleSubmit, values, errors, touched, isSubmitting }) => (
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <Text as='h1' color='prominent' weight='bold' align='center' className='change-currency__title'>
                        <Localize i18n_default_text='Change your currency' />
                    </Text>
                    <Text as='h3' size='xxs' align='center' className='change-currency__sub-title'>
                        <Localize i18n_default_text='Choose the currency you would like to trade with.' />
                    </Text>
                    {!can_change_fiat_currency && (
                        <div className='account-wizard--disabled-message'>
                            <Text
                                as='p'
                                align='center'
                                size='xxs'
                                className='account-wizard--disabled-message-description'
                            >
                                {current_currency_type === 'fiat' ? (
                                    <Localize
                                        i18n_default_text='Currency change is not available because either you have deposited money into your {{currency}} account or you have created a real MetaTrader 5 (MT5) account.'
                                        values={{
                                            currency: getCurrencyDisplayCode(client_currency),
                                        }}
                                    />
                                ) : (
                                    <Localize
                                        i18n_default_text='Please switch to your {{fiat_currency}} account to change currencies.'
                                        values={{
                                            fiat_currency: current_fiat_currency?.toUpperCase?.(),
                                        }}
                                    />
                                )}
                            </Text>
                        </div>
                    )}
                    <CurrencyRadioButtonGroup
                        id='fiat'
                        label={localize('Cryptocurrencies')}
                        className='currency-selector__radio-group currency-selector__radio-group--with-margin'
                        value={values.fiat}
                        error={errors.fiat}
                        touched={touched.fiat}
                        is_title_enabled={false}
                        item_count={getReorderedCurrencies().length}
                    >
                        {getReorderedCurrencies().map(currency => (
                            <Field
                                key={currency.value}
                                component={CurrencyRadioButton}
                                name='fiat'
                                id={currency.value}
                                label={currency.name}
                                selected={currency.value === client_currency}
                            />
                        ))}
                    </CurrencyRadioButtonGroup>
                    <FormSubmitButton
                        className='change-currency__button'
                        is_disabled={isSubmitting || !values.fiat}
                        label={localize('Change currency')}
                        is_absolute={!isMobile()}
                        form_error={form_error}
                    />
                </form>
            )}
        </Formik>
    );
};

ChangeAccountCurrency.propTypes = {
    legal_allowed_currencies: PropTypes.array,
    onSubmit: PropTypes.func,
    value: PropTypes.shape({
        crypto: PropTypes.string,
        fiat: PropTypes.string,
    }),
    form_error: PropTypes.string,
    can_change_fiat_currency: PropTypes.bool,
    currency: PropTypes.string,
    current_currency_type: PropTypes.string,
    current_fiat_currency: PropTypes.string,
    client_currency: PropTypes.string,
};

export default connect(({ client }) => ({
    legal_allowed_currencies: client.upgradeable_currencies,
    client_currency: client.currency,
    current_fiat_currency: client.current_fiat_currency,
}))(ChangeAccountCurrency);
