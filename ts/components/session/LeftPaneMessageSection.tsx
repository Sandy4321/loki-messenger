import React from 'react';

import { AutoSizer, List } from 'react-virtualized';

import { MainViewController } from '../MainViewController';
import {
  ConversationListItem,
  PropsData as ConversationListItemPropsType,
} from '../ConversationListItem';
import {
  PropsData as SearchResultsProps,
  SearchResults,
} from '../SearchResults';
import { SessionSearchInput } from './SessionSearchInput';
import { debounce } from 'lodash';
import { cleanSearchTerm } from '../../util/cleanSearchTerm';
import { SearchOptions } from '../../types/Search';
import { validateNumber } from '../../types/PhoneNumber';
import { LeftPane, RowRendererParamsType } from '../LeftPane';
import { SessionClosableOverlay } from './SessionClosableOverlay';

export interface Props {
  searchTerm: string;
  isSecondaryDevice: boolean;

  conversations?: Array<ConversationListItemPropsType>;

  searchResults?: SearchResultsProps;

  updateSearchTerm: (searchTerm: string) => void;
  search: (query: string, options: SearchOptions) => void;
  openConversationInternal: (id: string, messageId?: string) => void;
  clearSearch: () => void;
}

export class LeftPaneMessageSection extends React.Component<Props, any> {
  private readonly updateSearchBound: (searchedString: string) => void;
  private readonly debouncedSearch: (searchTerm: string) => void;

  public constructor(props: Props) {
    super(props);
    this.state = {
      showComposeView: false,
      pubKeyPasted: '',
    };

    this.updateSearchBound = this.updateSearch.bind(this);
    this.handleToggleOverlay = this.handleToggleOverlay.bind(this);
    this.handleOnPasteSessionID = this.handleOnPasteSessionID.bind(this);
    this.handleMessageButtonClick = this.handleMessageButtonClick.bind(this);
    this.debouncedSearch = debounce(this.search.bind(this), 20);
  }

  public componentWillUnmount() {
    this.updateSearch('');
  }

  public getCurrentConversations():
    | Array<ConversationListItemPropsType>
    | undefined {
    const { conversations } = this.props;

    let conversationList = conversations;
    if (conversationList !== undefined) {
      conversationList = conversationList.filter(
        conversation =>
          !conversation.isSecondary && !conversation.isPendingFriendRequest
      );
    }

    return conversationList;
  }

  public renderRow = ({
    index,
    key,
    style,
  }: RowRendererParamsType): JSX.Element => {
    const { openConversationInternal } = this.props;

    const conversations = this.getCurrentConversations();

    if (!conversations) {
      throw new Error('renderRow: Tried to render without conversations');
    }

    const conversation = conversations[index];

    return (
      <ConversationListItem
        key={key}
        style={style}
        {...conversation}
        onClick={openConversationInternal}
        i18n={window.i18n}
      />
    );
  };

  public renderList(): JSX.Element | Array<JSX.Element | null> {
    const { openConversationInternal, searchResults } = this.props;

    if (searchResults) {
      return (
        <SearchResults
          {...searchResults}
          openConversation={openConversationInternal}
          i18n={window.i18n}
        />
      );
    }

    const conversations = this.getCurrentConversations();
    if (!conversations) {
      throw new Error(
        'render: must provided conversations if no search results are provided'
      );
    }

    const length = conversations.length;
    const listKey = 0;

    // Note: conversations is not a known prop for List, but it is required to ensure that
    //   it re-renders when our conversation data changes. Otherwise it would just render
    //   on startup and scroll.
    const list = (
      <div className="module-left-pane__list" key={listKey}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              className="module-left-pane__virtual-list"
              conversations={conversations}
              height={height}
              rowCount={length}
              rowHeight={64}
              rowRenderer={this.renderRow}
              width={width}
              autoHeight={true}
            />
          )}
        </AutoSizer>
      </div>
    );

    return [list];
  }

  public componentDidMount() {
    MainViewController.renderMessageView();
  }

  public componentDidUpdate() {
    MainViewController.renderMessageView();
  }

  public renderHeader(): JSX.Element {
    const labels = [window.i18n('messagesHeader')];

    return LeftPane.RENDER_HEADER(
      labels,
      null,
      window.i18n('compose'),
      this.handleToggleOverlay
    );
  }

  public render(): JSX.Element {
    return (
      <div className="session-left-pane-section-content">
        {this.renderHeader()}
        {this.state.showComposeView
          ? this.renderClosableOverlay()
          : this.renderConversations()}
      </div>
    );
  }

  public renderConversations() {
    return (
      <div className="module-conversations-list-content">
        <SessionSearchInput
          searchString={this.props.searchTerm}
          onChange={this.updateSearchBound}
          placeholder={window.i18n('searchForAKeyPhrase')}
        />
        {this.renderList()}
      </div>
    );
  }

  public updateSearch(searchTerm: string) {
    const { updateSearchTerm, clearSearch } = this.props;

    if (!searchTerm) {
      clearSearch();

      return;
    }
    // reset our pubKeyPasted, we can either have a pasted sessionID or a sessionID got from a search
    this.setState({ pubKeyPasted: '' }, () => {
      window.Session.emptyContentEditableDivs();
    });

    if (updateSearchTerm) {
      updateSearchTerm(searchTerm);
    }

    if (searchTerm.length < 2) {
      return;
    }

    const cleanedTerm = cleanSearchTerm(searchTerm);
    if (!cleanedTerm) {
      return;
    }

    this.debouncedSearch(cleanedTerm);
  }

  public clearSearch() {
    this.props.clearSearch();
  }

  public search() {
    const { search } = this.props;
    const { searchTerm, isSecondaryDevice } = this.props;

    if (search) {
      search(searchTerm, {
        noteToSelf: window.i18n('noteToSelf').toLowerCase(),
        ourNumber: window.textsecure.storage.user.getNumber(),
        regionCode: '',
        isSecondaryDevice,
      });
    }
  }

  private renderClosableOverlay() {
    const { searchTerm, searchResults } = this.props;

    return (
      <SessionClosableOverlay
        overlayMode="message"
        onChangeSessionID={this.handleOnPasteSessionID}
        onCloseClick={this.handleToggleOverlay}
        onButtonClick={this.handleMessageButtonClick}
        searchTerm={searchTerm}
        searchResults={searchResults}
        updateSearch={this.updateSearchBound}
      />
    );
  }

  private handleToggleOverlay() {
    this.setState((state: any) => {
      return { showComposeView: !state.showComposeView };
    });
    // empty our generalized searchedString (one for the whole app)
    this.updateSearch('');
  }

  private handleOnPasteSessionID(e: any) {
    // reset our search, we can either have a pasted sessionID or a sessionID got from a search
    this.updateSearch('');
    const cleanText = e.target.innerHTML.replace(/<\/?[^>]+(>|$)/g, '');

    this.setState({ pubKeyPasted: cleanText });
  }

  private handleMessageButtonClick() {
    const { openConversationInternal } = this.props;

    if (!this.state.pubKeyPasted && !this.props.searchTerm) {
      window.pushToast({
        title: window.i18n('invalidNumberError'),
        type: 'error',
        id: 'invalidPubKey',
      });

      return;
    }
    let pubkey: string;
    pubkey = this.state.pubKeyPasted || this.props.searchTerm;

    const error = validateNumber(pubkey);
    if (!error) {
      openConversationInternal(pubkey);
    } else {
      window.pushToast({
        title: error,
        type: 'error',
        id: 'invalidPubKey',
      });
    }
  }
}
