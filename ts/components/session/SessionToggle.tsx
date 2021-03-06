import React from 'react';
import classNames from 'classnames';

interface Props {
  active: boolean;
  onClick: any;
}

interface State {
  active: boolean;
}

export class SessionToggle extends React.PureComponent<Props, State> {
  public static defaultProps = {
    onClick: () => null,
  };

  constructor(props: any) {
    super(props);
    this.clickHandler = this.clickHandler.bind(this);

    const { active } = this.props;

    this.state = {
      active: active,
    };
  }

  public render() {
    return (
      <div
        className={classNames(
          'session-toggle',
          this.state.active ? 'active' : ''
        )}
        role="button"
        onClick={this.clickHandler}
      >
        <div className="knob" />
      </div>
    );
  }

  private clickHandler(e: any) {
    this.setState({
      active: !this.state.active,
    });

    if (this.props.onClick) {
      e.stopPropagation();
      this.props.onClick();
    }
  }
}
