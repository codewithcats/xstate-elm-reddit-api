module SearchBox exposing (..)

import Html exposing (..)
import Html.Attributes as Attr
import Html.Events exposing (onInput)
import Json.Decode as D
import Json.Encode as E
import MachineConnector


type alias Model =
    { state : State
    , searchTerm : String
    }


initialModel : Model
initialModel =
    { state = Idle, searchTerm = "" }


type State
    = Idle
    | Ready
    | Searching


{-|

    {
        "value": "ready",
        "context": {
            "searchTerm": "term"
        }
    }

-}
modelDecoder : D.Decoder Model
modelDecoder =
    D.map2 Model stateDecoder searchTermDecoder


stateDecoder : D.Decoder State
stateDecoder =
    D.field "value" D.string
        |> D.andThen
            (\value ->
                case value of
                    "idle" ->
                        D.succeed Idle

                    "ready" ->
                        D.succeed Ready

                    "searching" ->
                        D.succeed Searching

                    v ->
                        D.fail ("Unknown state: " ++ v)
            )


searchTermDecoder : D.Decoder String
searchTermDecoder =
    D.at [ "context", "searchTerm" ] D.string


type Msg
    = TextChanged String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg state =
    case msg of
        TextChanged t ->
            ( state
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "SEARCH_BOX.SEARCH_TERM_CHANGED" )
                    , ( "searchTerm", E.string t )
                    ]
                )
            )


view : Model -> Html Msg
view model =
    div []
        [ input
            [ Attr.type_ "text"
            , onInput TextChanged
            , Attr.value model.searchTerm
            ]
            []
        , button [ Attr.disabled (model.state == Idle) ] [ text "Search Reddit" ]
        ]
