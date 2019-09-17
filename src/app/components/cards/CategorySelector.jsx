import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import { cleanReduxInput } from 'app/utils/ReduxForms';
import tt from 'counterpart';
import {
    APP_MAX_TAG,
    SCOT_TAGS,
    NORMAL_TAGS,
    LANGUAGE_TAGS,
} from 'app/client_config';

const MAX_TAG = APP_MAX_TAG || 10;

class CategorySelector extends React.Component {
    static propTypes = {
        // HTML props
        id: PropTypes.string, // DOM id for active component (focusing, etc...)
        autoComplete: PropTypes.string,
        placeholder: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        onBlur: PropTypes.func.isRequired,
        isEdit: PropTypes.bool,
        disabled: PropTypes.bool,
        value: PropTypes.string,
        tabIndex: PropTypes.number,

        // redux connect (overwrite in HTML)
        trending: PropTypes.object.isRequired, // Immutable.List
    };
    static defaultProps = {
        autoComplete: 'on',
        id: 'CategorySelectorId',
        isEdit: false,
    };
    constructor() {
        super();
        this.state = { createCategory: true };
        this.shouldComponentUpdate = shouldComponentUpdate(
            this,
            'CategorySelector'
        );
        this.categoryCreateToggle = e => {
            e.preventDefault();
            this.props.onChange();
            this.setState({ createCategory: !this.state.createCategory });
            setTimeout(() => this.refs.categoryRef.focus(), 300);
        };
        this.categorySelectOnChange = e => {
            e.preventDefault();
            const { value } = e.target;
            const { onBlur } = this.props; // call onBlur to trigger validation immediately
            if (value === 'new') {
                this.setState({ createCategory: true });
                setTimeout(() => {
                    if (onBlur) onBlur();
                    this.refs.categoryRef.focus();
                }, 300);
            } else this.props.onChange(e);
        };
        this.categoryTag = (categories, impProps) => {
            return categories.map((c, idx) => {
                return (
                    <span>
                        <a
                            key={idx}
                            values={c.split(':')[0]}
                            onClick={() => {
                                const values = c.split(':')[0].split(' ');
                                let tags = '';
                                values.forEach(value => {
                                    if (!impProps.value.includes(value)) {
                                        tags = (tags + ' ' + value).trim();
                                    }
                                });
                                impProps.onChange(
                                    `${impProps.value} ${tags}`.trim()
                                );
                            }}
                        >
                            #{c.split(':')[1]}
                        </a>{' '}
                        &nbsp;
                    </span>
                );
            });
        };
    }
    render() {
        const { trending, tabIndex, disabled } = this.props;
        const categories = trending.filterNot(c => validateCategory(c));
        const { createCategory } = this.state;

        const categoryOptions = categories.map((c, idx) => (
            <option value={c} key={idx}>
                {c}
            </option>
        ));

        const impProps = { ...this.props };
        const categoryInput = (
            <div>
                <span>
                    <input
                        type="text"
                        {...cleanReduxInput(impProps)}
                        ref="categoryRef"
                        tabIndex={tabIndex}
                        disabled={disabled}
                        autoCapitalize="none"
                    />
                </span>
                {tt('category_selector_jsx.language_tags')}
                <br />
                {this.categoryTag(LANGUAGE_TAGS, impProps)}
                <br />
                {tt('category_selector_jsx.normal_tags')}
                <br />
                {this.categoryTag(NORMAL_TAGS, impProps)}
                <br />
                {tt('category_selector_jsx.scot_tags')}
                <br />
                {this.categoryTag(SCOT_TAGS, impProps)}
                <br />
            </div>
        );

        const categorySelect = (
            <select
                {...cleanReduxInput(this.props)}
                onChange={this.categorySelectOnChange}
                ref="categoryRef"
                tabIndex={tabIndex}
                disabled={disabled}
            >
                <option value="">
                    {tt('category_selector_jsx.select_a_tag')}...
                </option>
                {categoryOptions}
                <option value="new">{this.props.placeholder}</option>
            </select>
        );
        return <span>{createCategory ? categoryInput : categorySelect}</span>;
    }
}
export function validateCategory(category, required = true) {
    if (!category || category.split(':')[0].trim() === '')
        return required ? tt('g.required') : null;
    const cats = category
        .split(':')[0]
        .trim()
        .split(' ');
    return (
        // !category || category.trim() === '' ? 'Required' :
        cats.length > MAX_TAG
            ? tt('category_selector_jsx.use_limited_amount_of_categories', {
                  amount: MAX_TAG,
              })
            : cats.find(c => c.length > 24)
              ? tt('category_selector_jsx.maximum_tag_length_is_24_characters')
              : cats.find(c => c.split('-').length > 2)
                ? tt('category_selector_jsx.use_one_dash')
                : cats.find(c => c.indexOf(',') >= 0)
                  ? tt('category_selector_jsx.use_spaces_to_separate_tags')
                  : cats.find(c => /[A-Z]/.test(c))
                    ? tt('category_selector_jsx.use_only_lowercase_letters')
                    : cats.find(c => !/^[a-z0-9-#]+$/.test(c))
                      ? tt('category_selector_jsx.use_only_allowed_characters')
                      : cats.find(c => !/^[a-z-#]/.test(c))
                        ? tt('category_selector_jsx.must_start_with_a_letter')
                        : cats.find(c => !/[a-z0-9]$/.test(c))
                          ? tt(
                                'category_selector_jsx.must_end_with_a_letter_or_number'
                            )
                          : null
    );
}
export default connect((state, ownProps) => {
    const trending = state.global.getIn(['tag_idx', 'trending']);
    // apply translations
    // they are used here because default prop can't acces intl property
    const placeholder = tt('category_selector_jsx.tag_your_story');
    return { trending, placeholder, ...ownProps };
})(CategorySelector);
