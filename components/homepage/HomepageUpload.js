import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import fetch from 'cross-fetch';
import classNames from 'classnames';

import supportedFiles from '../../src/dependencies/supported-files';

export default class HomepageUpload extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    onUpload: PropTypes.func,
    feedbackPosition: PropTypes.string,
  };

  static defaultProps = {
    style: {},
    feedbackPosition: 'float',
  };

  constructor(props) {
    super(props);
    this.state = { error: false };
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length === 0 && rejectedFiles.length > 0) {
      this.setErrorState();
    }
    if (acceptedFiles.length > 0) {
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('files', file);
      });
      fetch('/files/upload', { method: 'POST', body: formData }).then(
        (response) => {
          if (response.status !== 200) {
            this.setErrorState();
          } else if (this.props.onUpload) {
            this.props.onUpload();
            this.setState({ error: false });
          }
        },
      );
    }
  };

  setErrorState = () => {
    this.setState({ error: true });
    setTimeout(() => {
      this.setState({ error: false });
    }, 5000);
  };

  render() {
    const supportedFilesAsComponent = supportedFiles
      .map((file) => <em key={file}>{file}</em>)
      .reduce((acc, curr, idx, src) => {
        if (idx === 1) {
          return [curr];
        } else if (src.length - 1 === idx) {
          return [...acc, ' and ', curr];
        } else {
          return [...acc, ', ', curr];
        }
      });

    return (
      <Fragment>
        <style jsx global>
          {`
            .dropZoneComponent {
              border-width: 1px;
              border-color: #9399a3;
              border-style: dashed;
              border-radius: 4px;
              color: #9399a3;
              font-size: 12px;
              cursor: pointer;
              transition-duration: 1s;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 72px;
            }
            .dropZoneComponent .text {
              text-align: center;
            }
            .dropZoneComponent.active {
              color: #3c5869;
              border-color: #3c5869;
              height: 72px;
            }
            .dropZoneComponent.error {
              border-color: #f53152;
              background-color: #fff2f4;
            }
            .dropZoneComponent:hover {
              color: #272730;
            }
            .dropZoneComponent:active,
            .dropZoneComponent:focus {
              border-color: #3c5869;
            }
            .activeDrag {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-around;
              color: #3c5869;
              padding-top: 16px;
            }
            @media screen and (min-width: 1194px) {
              .uploadContainer,
              .uploadWrapper,
              .dropZoneComponent {
                min-width: 280px;
              }

              .uploadContainer:hover,
              .uploadWrapper:hover,
              .dropZoneComponent:hover {
                width: 287px;
              }
              .dropZoneComponent:hover {
                height: 74px;
              }
            }
          `}
        </style>

        <style jsx>
          {`
            .uploadFeedback {
              font-size: 12px;
              transition-duration: 1s;
              opacity: 0;
              display: none;
              color: #f53152;
            }
            .uploadFeedback.inside {
              text-align: center;
              background-color: #fff2f4;
              position: relative;
              padding: 20px;
            }
            .uploadFeedback.error {
              opacity: 1;
              display: block;
            }
          `}
        </style>

        <div className="uploadWrapper">
          <Dropzone
            onDrop={this.onDrop}
            className={classNames('dropZoneComponent', {
              error: this.state.error,
            })}
            activeClassName="active"
            maxSize={102400}
          >
            {({ isDragActive }) => {
              if (isDragActive) {
                return (
                  <div className="text activeDrag">
                    <img
                      src="/static/img/homepage/icon-drop.svg"
                      alt="Drop Icon"
                    />
                    <p>Drop file(s) here.</p>
                  </div>
                );
              }

              return (
                <div className="text">
                  <p>
                    Simply drag and drop files
                    <br />
                    or click to select files to upload.
                  </p>
                </div>
              );
            }}
          </Dropzone>
          <div
            className={classNames('uploadFeedback', {
              error: this.state.error,
              float: this.props.feedbackPosition === 'float',
              inside: this.props.feedbackPosition === 'inside',
            })}
          >
            <p>
              There was an error while uploading your files. At the moment, we
              support {supportedFilesAsComponent}. Please try again. If the
              problem persists, please contact us.
            </p>
          </div>
        </div>
      </Fragment>
    );
  }
}
